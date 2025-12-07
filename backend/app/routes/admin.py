from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.viewer_account import ViewerAccount
from app.models.web_series import WebSeries
from app.models.episode import Episode
from app.models.feedback import Feedback
from app.models.country import Country
from sqlalchemy import func, extract
from datetime import datetime, date
from functools import wraps
import re

admin_bp = Blueprint("admin", __name__)


def admin_required(f):
    """Decorator to ensure user is Admin"""

    @wraps(f)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if not user or user.account_type != "Admin":
            return jsonify({"error": "Admin access required"}), 403

        return f(*args, **kwargs)

    return wrapper


# ==================== User Management ====================


@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_all_users():
    """Get all users with filtering and pagination"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        search = request.args.get("search", "")
        account_type = request.args.get("account_type", "")
        is_active = request.args.get("is_active", "")

        query = ViewerAccount.query

        # Apply filters
        if search:
            query = query.filter(
                db.or_(
                    ViewerAccount.first_name.contains(search),
                    ViewerAccount.last_name.contains(search),
                    ViewerAccount.email.contains(search),
                    ViewerAccount.account_id.contains(search),
                )
            )

        if account_type:
            query = query.filter_by(account_type=account_type)

        if is_active:
            query = query.filter_by(is_active=is_active == "true")

        # Execute paginated query
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return (
            jsonify(
                {
                    "users": [u.to_dict() for u in pagination.items],
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": page,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Failed to fetch users", "message": str(e)}), 500


@admin_bp.route("/users/<account_id>", methods=["GET"])
@admin_required
def get_user(account_id):
    """Get specific user details"""
    try:
        user = ViewerAccount.query.get(account_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"user": user.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch user", "message": str(e)}), 500


@admin_bp.route("/users/<account_id>/role", methods=["PUT"])
@admin_required
def change_user_role(account_id):
    """Change user account type"""
    try:
        user = ViewerAccount.query.get(account_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        new_role = data.get("account_type")

        if new_role not in ["Customer", "Employee", "Admin"]:
            return jsonify({"error": "Invalid account type"}), 400

        user.account_type = new_role
        db.session.commit()

        return (
            jsonify(
                {
                    "message": f"User role updated to {new_role}",
                    "user": user.to_dict(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update user role", "message": str(e)}), 500


@admin_bp.route("/users/<account_id>/status", methods=["PUT"])
@admin_required
def toggle_user_status(account_id):
    """Activate or deactivate user account"""
    try:
        user = ViewerAccount.query.get(account_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        is_active = data.get("is_active")

        if is_active is None:
            return jsonify({"error": "is_active field is required"}), 400

        user.is_active = is_active
        db.session.commit()

        status_text = "activated" if is_active else "deactivated"
        return (
            jsonify(
                {"message": f"User {status_text} successfully", "user": user.to_dict()}
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "Failed to update user status", "message": str(e)}),
            500,
        )


@admin_bp.route("/users/<account_id>", methods=["DELETE"])
@admin_required
def delete_user(account_id):
    """Delete user account"""
    try:
        current_user_id = get_jwt_identity()
        if current_user_id == account_id:
            return jsonify({"error": "Cannot delete your own account"}), 400

        user = ViewerAccount.query.get(account_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "User deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete user", "message": str(e)}), 500


@admin_bp.route("/users/<account_id>/reset-password", methods=["POST"])
@admin_required
def reset_user_password(account_id):
    """Reset user password"""
    try:
        user = ViewerAccount.query.get(account_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        new_password = data.get("new_password")

        if not new_password:
            return jsonify({"error": "new_password is required"}), 400

        # Validate password
        if len(new_password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400
        if not re.search(r"[A-Z]", new_password):
            return (
                jsonify(
                    {"error": "Password must contain at least one uppercase letter"}
                ),
                400,
            )
        if not re.search(r"[a-z]", new_password):
            return (
                jsonify(
                    {"error": "Password must contain at least one lowercase letter"}
                ),
                400,
            )
        if not re.search(r"\d", new_password):
            return (
                jsonify({"error": "Password must contain at least one digit"}),
                400,
            )

        user.set_password(new_password)
        db.session.commit()

        return jsonify({"message": "Password reset successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "Failed to reset password", "message": str(e)}),
            500,
        )


# ==================== System Statistics ====================


@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_system_stats():
    """Get system-wide statistics"""
    try:
        # User statistics
        total_users = ViewerAccount.query.count()
        customers = ViewerAccount.query.filter_by(account_type="Customer").count()
        employees = ViewerAccount.query.filter_by(account_type="Employee").count()
        admins = ViewerAccount.query.filter_by(account_type="Admin").count()
        active_users = ViewerAccount.query.filter_by(is_active=True).count()

        # Series statistics
        total_series = WebSeries.query.count()
        total_episodes = Episode.query.count()
        total_feedback = Feedback.query.count()

        # Get current month series count
        current_month = datetime.now().month
        current_year = datetime.now().year
        series_this_month = (
            WebSeries.query.filter(
                extract("month", WebSeries.created_at) == current_month,
                extract("year", WebSeries.created_at) == current_year,
            ).count()
            if hasattr(WebSeries, "created_at")
            else 0
        )

        # Average rating
        avg_rating_result = db.session.query(func.avg(Feedback.rating)).scalar()
        avg_rating = round(float(avg_rating_result), 2) if avg_rating_result else 0

        return (
            jsonify(
                {
                    "users": {
                        "total": total_users,
                        "customers": customers,
                        "employees": employees,
                        "admins": admins,
                        "active": active_users,
                    },
                    "series": {
                        "total": total_series,
                        "this_month": series_this_month,
                        "total_episodes": total_episodes,
                    },
                    "feedback": {"total": total_feedback, "average_rating": avg_rating},
                }
            ),
            200,
        )

    except Exception as e:
        return (
            jsonify({"error": "Failed to fetch statistics", "message": str(e)}),
            500,
        )


# ==================== Country Management ====================


@admin_bp.route("/countries", methods=["GET"])
@admin_required
def get_all_countries():
    """Get all countries"""
    try:
        countries = Country.query.all()
        return (
            jsonify({"countries": [c.to_dict() for c in countries]}),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Failed to fetch countries", "message": str(e)}), 500


@admin_bp.route("/countries", methods=["POST"])
@admin_required
def create_country():
    """Create a new country"""
    try:
        data = request.get_json()
        country_name = data.get("country_name")

        if not country_name:
            return jsonify({"error": "country_name is required"}), 400

        # Check if country already exists
        existing = Country.query.get(country_name)
        if existing:
            return jsonify({"error": "Country already exists"}), 409

        new_country = Country(country_name=country_name)
        db.session.add(new_country)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Country created successfully",
                    "country": new_country.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create country", "message": str(e)}), 500


@admin_bp.route("/countries/<country_name>", methods=["DELETE"])
@admin_required
def delete_country(country_name):
    """Delete a country"""
    try:
        country = Country.query.get(country_name)
        if not country:
            return jsonify({"error": "Country not found"}), 404

        # Check if country is in use
        users_count = ViewerAccount.query.filter_by(country_name=country_name).count()
        if users_count > 0:
            return (
                jsonify(
                    {
                        "error": f"Cannot delete country. {users_count} users are associated with it."
                    }
                ),
                400,
            )

        db.session.delete(country)
        db.session.commit()

        return jsonify({"message": "Country deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete country", "message": str(e)}), 500


# ==================== System Logs ====================


@admin_bp.route("/logs", methods=["GET"])
@admin_required
def get_system_logs():
    """Get recent system activity logs"""
    try:
        # Get recent user registrations
        recent_users = (
            ViewerAccount.query.order_by(ViewerAccount.open_date.desc()).limit(10).all()
        )

        # Get recent series
        recent_series = WebSeries.query.limit(10).all()

        # Get recent feedback
        recent_feedback = (
            Feedback.query.order_by(Feedback.feedback_id.desc()).limit(10).all()
        )

        logs = []

        # Format logs
        for user in recent_users:
            logs.append(
                {
                    "type": "user_registration",
                    "timestamp": user.open_date.isoformat() if user.open_date else None,
                    "message": f"New user registered: {user.first_name} {user.last_name} ({user.email})",
                    "details": user.to_dict(),
                }
            )

        for series in recent_series:
            logs.append(
                {
                    "type": "series_created",
                    "timestamp": (
                        series.created_at.isoformat()
                        if hasattr(series, "created_at") and series.created_at
                        else None
                    ),
                    "message": f"New series added: {series.title}",
                    "details": {"webseries_id": series.webseries_id, "title": series.title},
                }
            )

        # Sort logs by timestamp
        logs.sort(key=lambda x: x["timestamp"] or "", reverse=True)

        return jsonify({"logs": logs[:20]}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch logs", "message": str(e)}), 500


# ==================== Database Maintenance ====================


@admin_bp.route("/maintenance/vacuum", methods=["POST"])
@admin_required
def vacuum_database():
    """Perform database vacuum (PostgreSQL/SQLite optimization)"""
    try:
        # This is a placeholder - actual implementation depends on database type
        return (
            jsonify(
                {
                    "message": "Database maintenance completed",
                    "note": "This is a simulated operation",
                }
            ),
            200,
        )

    except Exception as e:
        return (
            jsonify({"error": "Database maintenance failed", "message": str(e)}),
            500,
        )


@admin_bp.route("/maintenance/backup", methods=["POST"])
@admin_required
def backup_database():
    """Create database backup"""
    try:
        # This is a placeholder - actual implementation depends on deployment
        backup_time = datetime.now().isoformat()
        return (
            jsonify(
                {
                    "message": "Backup initiated",
                    "timestamp": backup_time,
                    "note": "This is a simulated operation",
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Backup failed", "message": str(e)}), 500


# ==================== Cache Management ====================


@admin_bp.route("/cache/clear", methods=["POST"])
@admin_required
def clear_cache():
    """Clear all cache"""
    from app.utils.cache import cache
    
    try:
        cache.clear_all()
        return (
            jsonify({"message": "All cache cleared successfully"}),
            200,
        )
    except Exception as e:
        return jsonify({"error": "Failed to clear cache", "message": str(e)}), 500


@admin_bp.route("/cache/clear/<pattern>", methods=["POST"])
@admin_required
def clear_cache_pattern(pattern):
    """Clear cache by pattern"""
    from app.utils.cache import cache
    
    try:
        cache.delete_pattern(f"{pattern}:*")
        return (
            jsonify({"message": f"Cache pattern '{pattern}:*' cleared successfully"}),
            200,
        )
    except Exception as e:
        return jsonify({"error": "Failed to clear cache pattern", "message": str(e)}), 500


@admin_bp.route("/cache/stats", methods=["GET"])
@admin_required
def cache_stats():
    """Get cache statistics"""
    from app.utils.cache import cache
    
    try:
        if not cache.redis_client:
            return jsonify({"error": "Redis not connected"}), 503
        
        info = cache.redis_client.info('stats')
        keyspace = cache.redis_client.info('keyspace')
        
        # Get sample keys for each pattern
        patterns = ['series', 'series_detail', 'episode', 'feedback']
        keys_by_pattern = {}
        
        for pattern in patterns:
            keys = cache.redis_client.keys(f"{pattern}:*")
            keys_by_pattern[pattern] = len(keys)
        
        return jsonify({
            "status": "connected",
            "total_keys": info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0),
            "hits": info.get('keyspace_hits', 0),
            "misses": info.get('keyspace_misses', 0),
            "keys_by_pattern": keys_by_pattern,
            "keyspace_info": keyspace
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Failed to get cache stats", "message": str(e)}), 500
