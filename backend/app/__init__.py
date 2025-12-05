from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from config import config

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
ma = Marshmallow()
migrate = Migrate()

# Import cache after initialization
from app.utils.cache import cache


def create_app(config_name="default"):
    """Application factory pattern"""
    app = Flask(__name__)

    # Disable strict slashes to allow routes with or without trailing slashes
    app.url_map.strict_slashes = False
    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    cache.init_app(app)

    # Configure CORS
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": app.config["CORS_ORIGINS"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
    )

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.series import series_bp
    from app.routes.episode import episode_bp
    from app.routes.feedback import feedback_bp
    from app.routes.production_house import production_house_bp
    from app.routes.producer import producer_bp
    from app.routes.admin import admin_bp
    from app.routes.relations import relations_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(series_bp, url_prefix="/api/series")
    app.register_blueprint(episode_bp, url_prefix="/api/episodes")
    app.register_blueprint(feedback_bp, url_prefix="/api/feedback")
    app.register_blueprint(production_house_bp, url_prefix="/api/production-houses")
    app.register_blueprint(producer_bp, url_prefix="/api/producers")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(relations_bp, url_prefix="/api/relations")

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {"error": "Internal server error"}, 500

    # Health check endpoint
    @app.route("/api/health")
    def health_check():
        return {"status": "healthy", "message": "API is running"}, 200

    return app
