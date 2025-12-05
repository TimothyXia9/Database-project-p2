from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.feedback import Feedback
from app.utils.security import generate_id
from app.utils.cache import cache_response, invalidate_cache
from datetime import date
from sqlalchemy import or_

feedback_bp = Blueprint("feedback", __name__)


@feedback_bp.route("", methods=["GET"])
@cache_response(timeout=180, key_prefix='feedback')
def get_all_feedback():
    """Get all feedback with search functionality (cached for 3 minutes)"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        webseries_id = request.args.get("webseries_id")
        search = request.args.get("search", "")

        query = Feedback.query

        if webseries_id:
            query = query.filter_by(webseries_id=webseries_id)

        if search:
            query = query.filter(
                or_(
                    Feedback.feedback_text.contains(search),
                    Feedback.feedback_id.contains(search),
                    Feedback.account_id.contains(search),
                    Feedback.webseries_id.contains(search),
                )
            )

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
@cache_response(timeout=300, key_prefix='feedback_detail')
def get_feedback(feedback_id):
    """Get single feedback (cached for 5 minutes)"""
    try:
        feedback = Feedback.query.get(feedback_id)

        if not feedback:
            return jsonify({"error": "Feedback not found"}), 404

        return jsonify({"feedback": feedback.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch feedback", "message": str(e)}), 500


@feedback_bp.route("", methods=["POST"])
@jwt_required()
@invalidate_cache(['feedback:*', 'feedback_detail:*', 'series:*', 'series_detail:*'])
def create_feedback():
    """Create new feedback - invalidates cache"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        print(f"[DEBUG] Create feedback request from user: {current_user_id}")
        print(f"[DEBUG] Request data: {data}")

        # Validate JSON data
        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ["rating", "feedback_text", "webseries_id"]
        for field in required_fields:
            if field not in data or data.get(field) is None or data.get(field) == "":
                return jsonify({"error": f"{field} is required", "field": field}), 400

        # Validate rating
        try:
            rating = int(data["rating"])
        except (ValueError, TypeError):
            return jsonify({"error": "Rating must be a number"}), 400

        if not 1 <= rating <= 5:
            return jsonify({"error": "Rating must be between 1 and 5"}), 400

        # Validate feedback_text length
        feedback_text = str(data["feedback_text"]).strip()
        if len(feedback_text) > 128:
            return (
                jsonify({"error": "Feedback text must not exceed 128 characters"}),
                400,
            )
        if len(feedback_text) == 0:
            return jsonify({"error": "Feedback text cannot be empty"}), 400

        # Check if user already submitted feedback for this series
        existing_feedback = Feedback.query.filter_by(
            account_id=current_user_id, webseries_id=data["webseries_id"]
        ).first()

        if existing_feedback:
            return (
                jsonify(
                    {"error": "You have already submitted feedback for this series"}
                ),
                409,
            )

        feedback_id = generate_id("FB", 8)
        print(f"[DEBUG] Generated feedback_id: {feedback_id}")

        new_feedback = Feedback(
            feedback_id=feedback_id,
            rating=rating,
            feedback_text=feedback_text,
            feedback_date=date.today(),
            account_id=current_user_id,
            webseries_id=data["webseries_id"],
        )

        db.session.add(new_feedback)
        db.session.commit()

        print(f"[DEBUG] Feedback created successfully: {feedback_id}")

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
        print(f"[ERROR] Failed to create feedback: {str(e)}")
        import traceback

        traceback.print_exc()
        return jsonify({"error": "Failed to create feedback", "message": str(e)}), 500


@feedback_bp.route("/<feedback_id>", methods=["PUT"])
@jwt_required()
@invalidate_cache(['feedback:*', 'feedback_detail:*', 'series:*', 'series_detail:*'])
def update_feedback(feedback_id):
    """Update feedback (owner only) - invalidates cache"""
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
@invalidate_cache(['feedback:*', 'feedback_detail:*', 'series:*', 'series_detail:*'])
def delete_feedback(feedback_id):
    """Delete feedback (owner or admin) - invalidates cache"""
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
