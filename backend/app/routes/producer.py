from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.producer import Producer
from app.models.viewer_account import ViewerAccount
from app.utils.security import generate_id
from sqlalchemy import or_

producer_bp = Blueprint("producer", __name__)


@producer_bp.route("", methods=["GET"])
def get_all_producers():
    """Get all producers with pagination and search"""
    try:
        # Pagination parameters
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)

        # Search parameters
        search = request.args.get("search", "")

        # Build query
        query = Producer.query

        if search:
            query = query.filter(
                or_(
                    Producer.first_name.contains(search),
                    Producer.last_name.contains(search),
                    Producer.email.contains(search),
                )
            )

        # Execute paginated query
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return (
            jsonify(
                {
                    "producers": [p.to_dict() for p in pagination.items],
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": page,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Failed to fetch producers", "message": str(e)}), 500


@producer_bp.route("<producer_id>", methods=["GET"])
def get_producer(producer_id):
    """Get single producer details"""
    try:
        producer = Producer.query.get(producer_id)

        if not producer:
            return jsonify({"error": "Producer not found"}), 404

        return jsonify({"producer": producer.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch producer", "message": str(e)}), 500


@producer_bp.route("", methods=["POST"])
@jwt_required()
def create_producer():
    """Create new producer (Employee/Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        # Permission check
        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        # Validate required fields
        required_fields = [
            "first_name",
            "last_name",
            "phone",
            "street",
            "city",
            "state",
            "email",
            "nationality",
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Check if email already exists
        if Producer.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email already exists"}), 400

        # Generate producer ID
        producer_id = generate_id("PR", 8)

        new_producer = Producer(
            producer_id=producer_id,
            first_name=data["first_name"],
            middle_name=data.get("middle_name"),
            last_name=data["last_name"],
            phone=data["phone"],
            street=data["street"],
            city=data["city"],
            state=data["state"],
            email=data["email"],
            nationality=data["nationality"],
        )

        db.session.add(new_producer)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Producer created successfully",
                    "producer": new_producer.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create producer", "message": str(e)}), 500


@producer_bp.route("/<producer_id>", methods=["PUT"])
@jwt_required()
def update_producer(producer_id):
    """Update producer information (Employee/Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        producer = Producer.query.get(producer_id)
        if not producer:
            return jsonify({"error": "Producer not found"}), 404

        data = request.get_json()

        # Update fields
        if "first_name" in data:
            producer.first_name = data["first_name"]
        if "middle_name" in data:
            producer.middle_name = data["middle_name"]
        if "last_name" in data:
            producer.last_name = data["last_name"]
        if "phone" in data:
            producer.phone = data["phone"]
        if "street" in data:
            producer.street = data["street"]
        if "city" in data:
            producer.city = data["city"]
        if "state" in data:
            producer.state = data["state"]
        if "email" in data:
            # Check if new email already exists
            existing = Producer.query.filter_by(email=data["email"]).first()
            if existing and existing.producer_id != producer_id:
                return jsonify({"error": "Email already exists"}), 400
            producer.email = data["email"]
        if "nationality" in data:
            producer.nationality = data["nationality"]

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Producer updated successfully",
                    "producer": producer.to_dict(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update producer", "message": str(e)}), 500


@producer_bp.route("/<producer_id>", methods=["DELETE"])
@jwt_required()
def delete_producer(producer_id):
    """Delete producer (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        producer = Producer.query.get(producer_id)
        if not producer:
            return jsonify({"error": "Producer not found"}), 404

        db.session.delete(producer)
        db.session.commit()

        return jsonify({"message": "Producer deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete producer", "message": str(e)}), 500
