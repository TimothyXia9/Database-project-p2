from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.web_series import WebSeries
from app.models.viewer_account import ViewerAccount
from app.utils.security import role_required, generate_id
from sqlalchemy import or_

series_bp = Blueprint("series", __name__)


@series_bp.route("", methods=["GET"])
def get_all_series():
    """Get all series with pagination and search"""
    try:
        # Pagination parameters
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)

        # Search parameters
        search = request.args.get("search", "")
        series_type = request.args.get("type", "")

        # Build query
        query = WebSeries.query

        if search:
            query = query.filter(
                or_(
                    WebSeries.title.contains(search),
                    WebSeries.webseries_id.contains(search),
                )
            )

        if series_type:
            query = query.filter_by(type=series_type)

        # Execute paginated query
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return (
            jsonify(
                {
                    "series": [s.to_dict() for s in pagination.items],
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": page,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Failed to fetch series", "message": str(e)}), 500


@series_bp.route("/<series_id>", methods=["GET"])
def get_series(series_id):
    """Get single series details"""
    try:
        series = WebSeries.query.get(series_id)

        if not series:
            return jsonify({"error": "Series not found"}), 404

        return jsonify({"series": series.to_dict(include_episodes=True)}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch series", "message": str(e)}), 500


@series_bp.route("", methods=["POST"])
@jwt_required()
def create_series():
    """Create new series (Employee/Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        # Permission check
        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        # Validate required fields
        required_fields = ["title", "type", "house_id"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Generate series ID
        series_id = generate_id("WS", 8)

        new_series = WebSeries(
            webseries_id=series_id,
            title=data["title"],
            num_episodes=data.get("num_episodes", 0),
            type=data["type"],
            house_id=data["house_id"],
        )

        db.session.add(new_series)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Series created successfully",
                    "series": new_series.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create series", "message": str(e)}), 500


@series_bp.route("/<series_id>", methods=["PUT"])
@jwt_required()
def update_series(series_id):
    """Update series information (Employee/Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        series = WebSeries.query.get(series_id)
        if not series:
            return jsonify({"error": "Series not found"}), 404

        data = request.get_json()

        # Update fields
        if "title" in data:
            series.title = data["title"]
        if "num_episodes" in data:
            series.num_episodes = data["num_episodes"]
        if "type" in data:
            series.type = data["type"]

        db.session.commit()

        return (
            jsonify(
                {"message": "Series updated successfully", "series": series.to_dict()}
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update series", "message": str(e)}), 500


@series_bp.route("/<series_id>", methods=["DELETE"])
@jwt_required()
def delete_series(series_id):
    """Delete series (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        series = WebSeries.query.get(series_id)
        if not series:
            return jsonify({"error": "Series not found"}), 404

        db.session.delete(series)
        db.session.commit()

        return jsonify({"message": "Series deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete series", "message": str(e)}), 500
