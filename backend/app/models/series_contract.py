from app import db
from datetime import datetime


class SeriesContract(db.Model):
    """Series Contract model"""

    __tablename__ = "series_contract"

    contract_id = db.Column(db.String(10), primary_key=True)
    signed_date = db.Column(db.Date, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    charge_per_episode = db.Column(db.Numeric(7, 2), nullable=False)
    status = db.Column(db.String(16), nullable=False, index=True)
    webseries_id = db.Column(
        db.String(10),
        db.ForeignKey("web_series.webseries_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            "contract_id": self.contract_id,
            "signed_date": self.signed_date.isoformat() if self.signed_date else None,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "charge_per_episode": float(self.charge_per_episode),
            "contract_amount": float(self.charge_per_episode),  # Alias for frontend compatibility
            "status": self.status,
            "contract_status": self.status,  # Alias for frontend compatibility
            "webseries_id": self.webseries_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<SeriesContract {self.contract_id}>"
