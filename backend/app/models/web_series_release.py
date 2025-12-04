from app import db
from datetime import datetime


class WebSeriesRelease(db.Model):
    """Web Series Release model"""

    __tablename__ = "web_series_release"

    webseries_id = db.Column(
        db.String(10),
        db.ForeignKey("web_series.webseries_id", ondelete="CASCADE"),
        primary_key=True,
    )
    country_name = db.Column(
        db.String(64),
        db.ForeignKey("country.country_name"),
        primary_key=True,
    )
    release_date = db.Column(db.Date, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "webseries_id": self.webseries_id,
            "country_name": self.country_name,
            "release_date": (
                self.release_date.isoformat() if self.release_date else None
            ),
        }

    def __repr__(self):
        return f"<WebSeriesRelease {self.webseries_id} - {self.country_name}>"
