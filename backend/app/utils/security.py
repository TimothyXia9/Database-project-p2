from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.viewer_account import ViewerAccount
import html
import re


def sanitize_input(text):
    """Sanitize user input to prevent XSS"""
    if not isinstance(text, str):
        return text

    # HTML escape
    text = html.escape(text)

    # Remove potential script tags
    text = re.sub(r"<script.*?</script>", "", text, flags=re.IGNORECASE | re.DOTALL)

    return text


def sanitize_dict(data):
    """Recursively sanitize all strings in a dictionary"""
    if isinstance(data, dict):
        return {k: sanitize_dict(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_dict(item) for item in data]
    elif isinstance(data, str):
        return sanitize_input(data)
    else:
        return data


def role_required(allowed_roles):
    """Decorator to check user role permissions"""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = ViewerAccount.query.get(current_user_id)

            if not user:
                return jsonify({"error": "User not found"}), 404

            if user.account_type not in allowed_roles:
                return jsonify({"error": "Insufficient permissions"}), 403

            return f(*args, **kwargs)

        return decorated_function

    return decorator


def generate_id(prefix, length=8):
    """Generate a unique ID with a prefix"""
    import uuid

    return f"{prefix}{str(uuid.uuid4().int)[:length]}"
