from app import db
from datetime import datetime


class SubtitleLanguage(db.Model):
    """Subtitle Language model"""

    __tablename__ = "subtitle_language"

    subtitle_language_id = db.Column(db.String(10), primary_key=True)
    language_name = db.Column(db.String(20), nullable=False)
    webseries_id = db.Column(
        db.String(10),
        db.ForeignKey("web_series.webseries_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = db.Column(db.DateTime, default=datetime.now)

    def to_dict(self):
        return {
            "subtitle_language_id": self.subtitle_language_id,
            "language": self.language_name,  # Map to 'language' for frontend
            "webseries_id": self.webseries_id,
        }

    def __repr__(self):
        return f"<SubtitleLanguage {self.language_name}>"
