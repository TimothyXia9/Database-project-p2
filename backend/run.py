#!/usr/bin/env python3
"""
Main application entry point
"""
import os
from app import create_app, db
from app.models import *  # Import all models for database creation

# Get configuration from environment
config_name = os.environ.get("FLASK_ENV", "development")

# Create app instance
app = create_app(config_name)


@app.shell_context_processor
def make_shell_context():
    """Make database and models available in Flask shell"""
    return {
        "db": db,
        "Country": Country,
        "ProductionHouse": ProductionHouse,
        "Producer": Producer,
        "ProducerAffiliation": ProducerAffiliation,
        "WebSeries": WebSeries,
        "Episode": Episode,
        "Telecast": Telecast,
        "SeriesContract": SeriesContract,
        "ViewerAccount": ViewerAccount,
        "Feedback": Feedback,
        "DubbingLanguage": DubbingLanguage,
        "SubtitleLanguage": SubtitleLanguage,
        "WebSeriesRelease": WebSeriesRelease,
    }


if __name__ == "__main__":
    # Get host and port from environment
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 5000))

    # Run the application
    app.run(host=host, port=port, debug=app.config["DEBUG"])
