from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.episode import Episode
from app.models.viewer_account import ViewerAccount
from app.utils.security import generate_id
from app.utils.cache import cache_response, invalidate_cache
from sqlalchemy import or_

episode_bp = Blueprint("episode", __name__)


@episode_bp.route("", methods=["GET"])
@cache_response(timeout=300, key_prefix='episode')
def get_all_episodes():
    """Get all episodes with search functionality (cached for 5 minutes)"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        webseries_id = request.args.get("webseries_id")
        search = request.args.get("search", "")

        query = Episode.query

        if webseries_id:
            query = query.filter_by(webseries_id=webseries_id)

        if search:
            query = query.filter(
                or_(
                    Episode.title.contains(search),
                    Episode.episode_id.contains(search),
                    Episode.webseries_id.contains(search),
                )
            )

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return (
            jsonify(
                {
                    "episodes": [ep.to_dict() for ep in pagination.items],
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": page,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Failed to fetch episodes", "message": str(e)}), 500


@episode_bp.route("/<episode_id>", methods=["GET"])
@cache_response(timeout=600, key_prefix='episode_detail')
def get_episode(episode_id):
    """Get single episode (cached for 10 minutes)"""
    try:
        episode = Episode.query.get(episode_id)

        if not episode:
            return jsonify({"error": "Episode not found"}), 404

        return jsonify({"episode": episode.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch episode", "message": str(e)}), 500


@episode_bp.route("", methods=["POST"])
@jwt_required()
@invalidate_cache(['episode:*', 'episode_detail:*', 'series:*', 'series_detail:*'])
def create_episode():
    """Create new episode (Employee/Admin only) - invalidates cache"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        required_fields = ["episode_number", "webseries_id"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        episode_id = generate_id("EP", 8)

        new_episode = Episode(
            episode_id=episode_id,
            episode_number=data["episode_number"],
            title=data.get("title"),
            webseries_id=data["webseries_id"],
            duration_minutes=data.get("duration_minutes"),
            release_date=data.get("release_date"),
        )

        db.session.add(new_episode)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Episode created successfully",
                    "episode": new_episode.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create episode", "message": str(e)}), 500


@episode_bp.route("/<episode_id>", methods=["PUT"])
@jwt_required()
@invalidate_cache(['episode:*', 'episode_detail:*', 'series:*', 'series_detail:*'])
def update_episode(episode_id):
    """Update episode (Employee/Admin only) - invalidates cache"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        episode = Episode.query.get(episode_id)
        if not episode:
            return jsonify({"error": "Episode not found"}), 404

        data = request.get_json()

        if "title" in data:
            episode.title = data["title"]
        if "duration_minutes" in data:
            episode.duration_minutes = data["duration_minutes"]
        if "release_date" in data:
            episode.release_date = data["release_date"]

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Episode updated successfully",
                    "episode": episode.to_dict(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update episode", "message": str(e)}), 500


@episode_bp.route("/<episode_id>", methods=["DELETE"])
@jwt_required()
@invalidate_cache(['episode:*', 'episode_detail:*', 'series:*', 'series_detail:*'])
def delete_episode(episode_id):
    """Delete episode (Admin only) - invalidates cache"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        episode = Episode.query.get(episode_id)
        if not episode:
            return jsonify({"error": "Episode not found"}), 404

        db.session.delete(episode)
        db.session.commit()

        return jsonify({"message": "Episode deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete episode", "message": str(e)}), 500
