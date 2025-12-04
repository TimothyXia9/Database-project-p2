from app import db
from datetime import datetime


class Telecast(db.Model):
    """Telecast model"""

    __tablename__ = "telecast"

    telecast_id = db.Column(db.String(10), primary_key=True)
    start_date = db.Column(db.DateTime, nullable=False, index=True)
    end_date = db.Column(db.DateTime, nullable=False, index=True)
    tech_interruption = db.Column(db.String(1), nullable=False, default="N")
    total_viewers = db.Column(db.BigInteger, nullable=False, default=0)
    episode_id = db.Column(
        db.String(10),
        db.ForeignKey("episode.episode_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            "telecast_id": self.telecast_id,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "tech_interruption": self.tech_interruption,
            "total_viewers": self.total_viewers,
            "episode_id": self.episode_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Telecast {self.telecast_id}>"
