from app import db
from datetime import datetime


class DubbingLanguage(db.Model):
    """Dubbing Language model"""

    __tablename__ = "dubbing_language"

    dubbing_language_id = db.Column(db.String(10), primary_key=True)
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
            "dubbing_language_id": self.dubbing_language_id,
            "language_name": self.language_name,
            "webseries_id": self.webseries_id,
        }

    def __repr__(self):
        return f"<DubbingLanguage {self.language_name}>"
