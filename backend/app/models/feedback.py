from app import db
from datetime import datetime


class Feedback(db.Model):
    """Feedback model"""

    __tablename__ = "feedback"

    feedback_id = db.Column(db.String(10), primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    feedback_text = db.Column(db.String(128), nullable=False)
    feedback_date = db.Column(db.Date, nullable=False)
    account_id = db.Column(
        db.String(10),
        db.ForeignKey("viewer_account.account_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    webseries_id = db.Column(
        db.String(10),
        db.ForeignKey("web_series.webseries_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def to_dict(self, include_viewer=True):
        result = {
            "feedback_id": self.feedback_id,
            "rating": self.rating,
            "feedback_text": self.feedback_text,
            "feedback_date": (
                self.feedback_date.isoformat() if self.feedback_date else None
            ),
            "account_id": self.account_id,
            "webseries_id": self.webseries_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

        if include_viewer and self.viewer:
            result["viewer_account"] = {
                "account_id": self.viewer.account_id,
                "first_name": self.viewer.first_name,
                "last_name": self.viewer.last_name,
                "email": self.viewer.email,
            }

        return result

    def __repr__(self):
        return f"<Feedback {self.feedback_id}>"
