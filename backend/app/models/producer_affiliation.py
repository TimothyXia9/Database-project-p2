from app import db
from datetime import datetime


class ProducerAffiliation(db.Model):
    """Producer Affiliation model - Many-to-many relationship"""

    __tablename__ = "producer_affiliation"

    producer_id = db.Column(
        db.String(10),
        db.ForeignKey("producer.producer_id", ondelete="CASCADE"),
        primary_key=True,
    )
    house_id = db.Column(
        db.String(10),
        db.ForeignKey("production_house.house_id", ondelete="CASCADE"),
        primary_key=True,
    )
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            "producer_id": self.producer_id,
            "house_id": self.house_id,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<ProducerAffiliation {self.producer_id} - {self.house_id}>"
