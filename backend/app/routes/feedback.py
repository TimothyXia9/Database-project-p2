from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.feedback import Feedback
from app.utils.security import generate_id
from datetime import date

feedback_bp = Blueprint("feedback", __name__)


@feedback_bp.route("/", methods=["GET"])
def get_all_feedback():
    """Get all feedback"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        webseries_id = request.args.get("webseries_id")

        query = Feedback.query

        if webseries_id:
            query = query.filter_by(webseries_id=webseries_id)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return (
            jsonify(
                {
                    "feedback": [f.to_dict() for f in pagination.items],
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": page,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Failed to fetch feedback", "message": str(e)}), 500


@feedback_bp.route("/<feedback_id>", methods=["GET"])
def get_feedback(feedback_id):
    """Get single feedback"""
    try:
        feedback = Feedback.query.get(feedback_id)

        if not feedback:
            return jsonify({"error": "Feedback not found"}), 404

        return jsonify({"feedback": feedback.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch feedback", "message": str(e)}), 500


@feedback_bp.route("/", methods=["POST"])
@jwt_required()
def create_feedback():
    """Create new feedback"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        required_fields = ["rating", "feedback_text", "webseries_id"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Validate rating
        if not 1 <= data["rating"] <= 5:
            return jsonify({"error": "Rating must be between 1 and 5"}), 400

        feedback_id = generate_id("FB", 8)

        new_feedback = Feedback(
            feedback_id=feedback_id,
            rating=data["rating"],
            feedback_text=data["feedback_text"],
            feedback_date=date.today(),
            account_id=current_user_id,
            webseries_id=data["webseries_id"],
        )

        db.session.add(new_feedback)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Feedback created successfully",
                    "feedback": new_feedback.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create feedback", "message": str(e)}), 500


@feedback_bp.route("/<feedback_id>", methods=["PUT"])
@jwt_required()
def update_feedback(feedback_id):
    """Update feedback (owner only)"""
    try:
        current_user_id = get_jwt_identity()

        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({"error": "Feedback not found"}), 404

        # Check ownership
        if feedback.account_id != current_user_id:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        if "rating" in data:
            if not 1 <= data["rating"] <= 5:
                return jsonify({"error": "Rating must be between 1 and 5"}), 400
            feedback.rating = data["rating"]

        if "feedback_text" in data:
            feedback.feedback_text = data["feedback_text"]

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Feedback updated successfully",
                    "feedback": feedback.to_dict(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update feedback", "message": str(e)}), 500


@feedback_bp.route("/<feedback_id>", methods=["DELETE"])
@jwt_required()
def delete_feedback(feedback_id):
    """Delete feedback (owner or admin)"""
    try:
        current_user_id = get_jwt_identity()
        from app.models.viewer_account import ViewerAccount

        user = ViewerAccount.query.get(current_user_id)

        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({"error": "Feedback not found"}), 404

        # Check ownership or admin
        if feedback.account_id != current_user_id and user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        db.session.delete(feedback)
        db.session.commit()

        return jsonify({"message": "Feedback deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete feedback", "message": str(e)}), 500
