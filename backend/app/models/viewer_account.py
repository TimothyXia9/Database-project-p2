from app import db, bcrypt
from datetime import datetime


class ViewerAccount(db.Model):
    """Viewer Account model"""

    __tablename__ = "viewer_account"

    account_id = db.Column(db.String(10), primary_key=True)
    first_name = db.Column(db.String(30), nullable=False)
    middle_name = db.Column(db.String(30))
    last_name = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(64), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    street = db.Column(db.String(64), nullable=False)
    city = db.Column(db.String(64), nullable=False)
    state = db.Column(db.String(64), nullable=False)
    country_name = db.Column(db.String(64), db.ForeignKey("country.country_name"))
    open_date = db.Column(db.Date, nullable=False)
    monthly_service_charge = db.Column(db.Numeric(10, 2), nullable=False)
    account_type = db.Column(db.String(20), nullable=False, default="Customer")
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    feedbacks = db.relationship(
        "Feedback", backref="viewer", lazy="dynamic", cascade="all, delete-orphan"
    )

    def set_password(self, password):
        """Set hashed password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        """Verify password"""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Convert to dictionary (exclude password)"""
        return {
            "account_id": self.account_id,
            "first_name": self.first_name,
            "middle_name": self.middle_name,
            "last_name": self.last_name,
            "email": self.email,
            "street": self.street,
            "city": self.city,
            "state": self.state,
            "country_name": self.country_name,
            "account_type": self.account_type,
            "is_active": self.is_active,
            "open_date": self.open_date.isoformat() if self.open_date else None,
            "monthly_service_charge": float(self.monthly_service_charge),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<ViewerAccount {self.email}>"
