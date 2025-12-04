from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.production_house import ProductionHouse
from app.models.viewer_account import ViewerAccount
from app.utils.security import generate_id

production_house_bp = Blueprint("production_house", __name__)


@production_house_bp.route("", methods=["GET"])
def get_all_production_houses():
    """Get all production houses"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)

        pagination = ProductionHouse.query.paginate(
            page=page, per_page=per_page, error_out=False
        )

        return (
            jsonify(
                {
                    "production_houses": [ph.to_dict() for ph in pagination.items],
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": page,
                }
            ),
            200,
        )

    except Exception as e:
        return (
            jsonify({"error": "Failed to fetch production houses", "message": str(e)}),
            500,
        )


@production_house_bp.route("<house_id>", methods=["GET"])
def get_production_house(house_id):
    """Get single production house"""
    try:
        house = ProductionHouse.query.get(house_id)

        if not house:
            return jsonify({"error": "Production house not found"}), 404

        return jsonify({"production_house": house.to_dict(include_series=True)}), 200

    except Exception as e:
        return (
            jsonify({"error": "Failed to fetch production house", "message": str(e)}),
            500,
        )


@production_house_bp.route("", methods=["POST"])
@jwt_required()
def create_production_house():
    """Create new production house (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        required_fields = [
            "name",
            "year_established",
            "street",
            "city",
            "state",
            "nationality",
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        house_id = generate_id("PH", 6)

        new_house = ProductionHouse(
            house_id=house_id,
            name=data["name"],
            year_established=data["year_established"],
            street=data["street"],
            city=data["city"],
            state=data["state"],
            nationality=data["nationality"],
        )

        db.session.add(new_house)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Production house created successfully",
                    "production_house": new_house.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "Failed to create production house", "message": str(e)}),
            500,
        )


@production_house_bp.route("/<house_id>", methods=["PUT"])
@jwt_required()
def update_production_house(house_id):
    """Update production house (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        house = ProductionHouse.query.get(house_id)
        if not house:
            return jsonify({"error": "Production house not found"}), 404

        data = request.get_json()

        if "name" in data:
            house.name = data["name"]
        if "year_established" in data:
            house.year_established = data["year_established"]
        if "street" in data:
            house.street = data["street"]
        if "city" in data:
            house.city = data["city"]
        if "state" in data:
            house.state = data["state"]
        if "nationality" in data:
            house.nationality = data["nationality"]

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Production house updated successfully",
                    "production_house": house.to_dict(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "Failed to update production house", "message": str(e)}),
            500,
        )


@production_house_bp.route("/<house_id>", methods=["DELETE"])
@jwt_required()
def delete_production_house(house_id):
    """Delete production house (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        house = ProductionHouse.query.get(house_id)
        if not house:
            return jsonify({"error": "Production house not found"}), 404

        db.session.delete(house)
        db.session.commit()

        return jsonify({"message": "Production house deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "Failed to delete production house", "message": str(e)}),
            500,
        )
