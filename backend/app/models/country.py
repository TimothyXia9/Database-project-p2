from app import db
from datetime import datetime


class Country(db.Model):
    """Country model"""

    __tablename__ = "country"

    country_name = db.Column(db.String(64), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    viewer_accounts = db.relationship(
        "ViewerAccount", backref="country", lazy="dynamic"
    )
    web_series_releases = db.relationship(
        "WebSeriesRelease", backref="country", lazy="dynamic"
    )

    def to_dict(self):
        return {
            "country_name": self.country_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Country {self.country_name}>"
