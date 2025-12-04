from app import db
from datetime import datetime


class Episode(db.Model):
    """Episode model"""

    __tablename__ = "episode"

    episode_id = db.Column(db.String(10), primary_key=True)
    episode_number = db.Column(db.String(10), nullable=False, index=True)
    title = db.Column(db.String(64))
    webseries_id = db.Column(
        db.String(10),
        db.ForeignKey("web_series.webseries_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    duration_minutes = db.Column(db.Integer)
    release_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    telecasts = db.relationship(
        "Telecast", backref="episode", lazy="dynamic", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "episode_id": self.episode_id,
            "episode_number": self.episode_number,
            "title": self.title,
            "webseries_id": self.webseries_id,
            "duration_minutes": self.duration_minutes,
            "release_date": (
                self.release_date.isoformat() if self.release_date else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Episode {self.title or self.episode_number}>"
