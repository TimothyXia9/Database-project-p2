from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from app import db
from app.models.viewer_account import ViewerAccount
from app.models.country import Country
from app.utils.security import generate_id, sanitize_input
from datetime import date
import re

auth_bp = Blueprint("auth", __name__)


def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return "Password must be at least 8 characters"
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return "Password must contain at least one digit"
    return None


@auth_bp.route("/register", methods=["POST"])
def register():
    """User registration"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = [
            "first_name",
            "last_name",
            "email",
            "password",
            "street",
            "city",
            "state",
            "country_name",
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Validate password
        password_error = validate_password(data["password"])
        if password_error:
            return jsonify({"error": password_error}), 400

        # Check if email already exists
        if ViewerAccount.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email already registered"}), 409

        # Ensure country exists
        country = Country.query.get(data["country_name"])
        if not country:
            # Create country if it doesn't exist
            country = Country(country_name=data["country_name"])
            db.session.add(country)

        # Generate account ID
        account_id = generate_id("ACC", 7)

        # Sanitize user inputs to prevent XSS
        first_name = sanitize_input(data["first_name"])
        middle_name = sanitize_input(data.get("middle_name")) if data.get("middle_name") else None
        last_name = sanitize_input(data["last_name"])
        street = sanitize_input(data["street"])
        city = sanitize_input(data["city"])
        state = sanitize_input(data["state"])
        country_name = sanitize_input(data["country_name"])

        # Create new user
        new_user = ViewerAccount(
            account_id=account_id,
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
            email=data["email"],  # Email is validated and used for login, no need to sanitize
            street=street,
            city=city,
            state=state,
            country_name=country_name,
            open_date=date.today(),
            monthly_service_charge=9.99,
            account_type=data.get("account_type", "Customer"),
        )
        new_user.set_password(data["password"])

        db.session.add(new_user)
        db.session.commit()

        # Generate tokens
        access_token = create_access_token(identity=account_id)
        refresh_token = create_refresh_token(identity=account_id)

        return (
            jsonify(
                {
                    "message": "User registered successfully",
                    "user": new_user.to_dict(),
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed", "message": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """User login"""
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        # Find user
        user = ViewerAccount.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid email or password"}), 401

        if not user.is_active:
            return jsonify({"error": "Account is inactive"}), 403

        # Generate tokens
        access_token = create_access_token(identity=user.account_id)
        refresh_token = create_refresh_token(identity=user.account_id)

        return (
            jsonify(
                {
                    "message": "Login successful",
                    "user": user.to_dict(),
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Login failed", "message": str(e)}), 500


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    return jsonify({"access_token": access_token}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get current user information"""
    current_user_id = get_jwt_identity()
    user = ViewerAccount.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200
