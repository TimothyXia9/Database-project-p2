from app import db
from datetime import datetime


class Producer(db.Model):
    """Producer model"""

    __tablename__ = "producer"

    producer_id = db.Column(db.String(10), primary_key=True)
    first_name = db.Column(db.String(64), nullable=False)
    middle_name = db.Column(db.String(64))
    last_name = db.Column(db.String(64), nullable=False, index=True)
    phone = db.Column(db.BigInteger, nullable=False)
    street = db.Column(db.String(64), nullable=False)
    city = db.Column(db.String(64), nullable=False)
    state = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(64), unique=True, nullable=False, index=True)
    nationality = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    affiliations = db.relationship(
        "ProducerAffiliation",
        backref="producer",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )

    def to_dict(self):
        return {
            "producer_id": self.producer_id,
            "first_name": self.first_name,
            "middle_name": self.middle_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "email": self.email,
            "city": self.city,
            "state": self.state,
            "nationality": self.nationality,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Producer {self.first_name} {self.last_name}>"
