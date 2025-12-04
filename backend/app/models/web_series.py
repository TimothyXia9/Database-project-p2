from app import db
from datetime import datetime


class WebSeries(db.Model):
    """Web Series model"""

    __tablename__ = "web_series"

    webseries_id = db.Column(db.String(10), primary_key=True)
    title = db.Column(db.String(64), nullable=False, index=True)
    num_episodes = db.Column(db.Integer, nullable=False, default=0)
    type = db.Column(db.String(15), nullable=False, index=True)
    house_id = db.Column(
        db.String(10),
        db.ForeignKey("production_house.house_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    episodes = db.relationship(
        "Episode", backref="series", lazy="dynamic", cascade="all, delete-orphan"
    )
    contracts = db.relationship(
        "SeriesContract",
        backref="series",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )
    feedbacks = db.relationship(
        "Feedback", backref="series", lazy="dynamic", cascade="all, delete-orphan"
    )
    dubbing_languages = db.relationship(
        "DubbingLanguage",
        backref="series",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )
    subtitle_languages = db.relationship(
        "SubtitleLanguage",
        backref="series",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )
    releases = db.relationship(
        "WebSeriesRelease",
        backref="series",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )

    def to_dict(self, include_episodes=False):
        data = {
            "webseries_id": self.webseries_id,
            "title": self.title,
            "num_episodes": self.num_episodes,
            "type": self.type,
            "house_id": self.house_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

        if include_episodes:
            data["episodes"] = [ep.to_dict() for ep in self.episodes]

        # Calculate average rating from feedback
        feedbacks = self.feedbacks.all()
        if feedbacks:
            avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks)
            data["rating"] = round(avg_rating, 1)
        else:
            data["rating"] = None

        return data

    def __repr__(self):
        return f"<WebSeries {self.title}>"
