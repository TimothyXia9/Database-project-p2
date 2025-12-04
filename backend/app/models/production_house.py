from app import db
from datetime import datetime


class ProductionHouse(db.Model):
    """Production House model"""

    __tablename__ = "production_house"

    house_id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(64), nullable=False, index=True)
    year_established = db.Column(db.String(10), nullable=False)
    street = db.Column(db.String(64), nullable=False)
    city = db.Column(db.String(64), nullable=False)
    state = db.Column(db.String(64), nullable=False)
    nationality = db.Column(db.String(20), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    web_series = db.relationship(
        "WebSeries", backref="production_house", lazy="dynamic"
    )
    producer_affiliations = db.relationship(
        "ProducerAffiliation",
        backref="production_house",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )

    def to_dict(self, include_series=False):
        data = {
            "house_id": self.house_id,
            "name": self.name,
            "year_established": self.year_established,
            "street": self.street,
            "city": self.city,
            "state": self.state,
            "nationality": self.nationality,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

        if include_series:
            data["web_series"] = [series.to_dict() for series in self.web_series]

        return data

    def __repr__(self):
        return f"<ProductionHouse {self.name}>"
