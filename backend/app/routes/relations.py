"""
API routes for relationship tables:
- Producer Affiliation
- Telecast
- Series Contract
- Subtitle Language
- Web Series Release
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.viewer_account import ViewerAccount
from app.models.producer_affiliation import ProducerAffiliation
from app.models.telecast import Telecast
from app.models.series_contract import SeriesContract
from app.models.subtitle_language import SubtitleLanguage
from app.models.web_series_release import WebSeriesRelease
from app.utils.security import generate_id
from datetime import datetime

relations_bp = Blueprint("relations", __name__)


# ==================== Producer Affiliation ====================


@relations_bp.route("/producer-affiliations", methods=["GET"])
def get_all_affiliations():
    """Get all producer affiliations"""
    try:
        from app.models.producer import Producer
        from app.models.production_house import ProductionHouse

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 100, type=int)
        producer_id = request.args.get("producer_id", "", type=str)
        house_id = request.args.get("house_id", "", type=str)
        search = request.args.get("search", "", type=str)

        query = ProducerAffiliation.query

        # Filter by producer_id
        if producer_id:
            query = query.filter(ProducerAffiliation.producer_id == producer_id)

        # Filter by house_id
        if house_id:
            query = query.filter(ProducerAffiliation.house_id == house_id)

        # Search by producer_id or house_id
        if search:
            query = query.filter(
                db.or_(
                    ProducerAffiliation.producer_id.like(f"%{search}%"),
                    ProducerAffiliation.house_id.like(f"%{search}%")
                )
            )

        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )

        # Enrich with producer and house names
        result_list = []
        for a in pagination.items:
            item_dict = a.to_dict()
            producer = Producer.query.get(a.producer_id)
            house = ProductionHouse.query.get(a.house_id)

            if producer:
                item_dict["producer_name"] = f"{producer.first_name} {producer.last_name}"
            else:
                item_dict["producer_name"] = None

            if house:
                item_dict["house_name"] = house.name
            else:
                item_dict["house_name"] = None

            result_list.append(item_dict)

        return (
            jsonify(
                {
                    "affiliations": result_list,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": page,
                }
            ),
            200,
        )
    except Exception as e:
        return (
            jsonify({"error": "Failed to fetch affiliations", "message": str(e)}),
            500,
        )


@relations_bp.route("/producer-affiliations", methods=["POST"])
@jwt_required()
def create_affiliation():
    """Create producer affiliation (Employee/Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        required_fields = ["producer_id", "house_id", "start_date"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Check if affiliation already exists
        existing = ProducerAffiliation.query.filter_by(
            producer_id=data["producer_id"], house_id=data["house_id"]
        ).first()
        if existing:
            return jsonify({"error": "Affiliation already exists"}), 409

        new_affiliation = ProducerAffiliation(
            producer_id=data["producer_id"],
            house_id=data["house_id"],
            start_date=datetime.strptime(data["start_date"], "%Y-%m-%d").date(),
            end_date=(
                datetime.strptime(data["end_date"], "%Y-%m-%d").date()
                if data.get("end_date")
                else None
            ),
        )

        db.session.add(new_affiliation)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Affiliation created successfully",
                    "affiliation": new_affiliation.to_dict(),
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "Failed to create affiliation", "message": str(e)}),
            500,
        )


@relations_bp.route(
    "/producer-affiliations/<producer_id>/<house_id>", methods=["DELETE"]
)
@jwt_required()
def delete_affiliation(producer_id, house_id):
    """Delete producer affiliation (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        affiliation = ProducerAffiliation.query.filter_by(
            producer_id=producer_id, house_id=house_id
        ).first()

        if not affiliation:
            return jsonify({"error": "Affiliation not found"}), 404

        db.session.delete(affiliation)
        db.session.commit()

        return jsonify({"message": "Affiliation deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "Failed to delete affiliation", "message": str(e)}),
            500,
        )


# ==================== Telecast ====================


@relations_bp.route("/telecasts", methods=["GET"])
def get_all_telecasts():
    """Get all telecasts"""
    try:
        from app.models.episode import Episode

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 100, type=int)
        episode_id = request.args.get("episode_id", "", type=str)
        search = request.args.get("search", "", type=str)

        query = Telecast.query

        # Filter by episode_id
        if episode_id:
            query = query.filter(Telecast.episode_id == episode_id)

        # Search by telecast_id or episode_id
        if search:
            query = query.filter(
                db.or_(
                    Telecast.telecast_id.like(f"%{search}%"),
                    Telecast.episode_id.like(f"%{search}%")
                )
            )

        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )

        # Enrich with episode and series info
        result_list = []
        for t in pagination.items:
            item_dict = t.to_dict()
            episode = Episode.query.get(t.episode_id)
            if episode:
                item_dict["episode_title"] = episode.title
                # Get series title via episode
                from app.models.web_series import WebSeries
                series = WebSeries.query.get(episode.webseries_id)
                item_dict["series_title"] = series.title if series else None
            else:
                item_dict["episode_title"] = None
                item_dict["series_title"] = None
            result_list.append(item_dict)

        return (
            jsonify(
                {
                    "telecasts": result_list,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": page,
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": "Failed to fetch telecasts", "message": str(e)}), 500


@relations_bp.route("/telecasts", methods=["POST"])
@jwt_required()
def create_telecast():
    """Create telecast (Employee/Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        required_fields = ["start_date", "end_date", "episode_id"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        telecast_id = generate_id("TC", 8)

        new_telecast = Telecast(
            telecast_id=telecast_id,
            start_date=datetime.strptime(data["start_date"], "%Y-%m-%dT%H:%M"),
            end_date=datetime.strptime(data["end_date"], "%Y-%m-%dT%H:%M"),
            tech_interruption=data.get("tech_interruption", "N"),
            total_viewers=data.get("total_viewers", 0),
            episode_id=data["episode_id"],
        )

        db.session.add(new_telecast)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Telecast created successfully",
                    "telecast": new_telecast.to_dict(),
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create telecast", "message": str(e)}), 500


@relations_bp.route("/telecasts/<telecast_id>", methods=["PUT"])
@jwt_required()
def update_telecast(telecast_id):
    """Update telecast (Employee/Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        telecast = Telecast.query.get(telecast_id)
        if not telecast:
            return jsonify({"error": "Telecast not found"}), 404

        data = request.get_json()

        if "start_date" in data:
            telecast.start_date = datetime.strptime(data["start_date"], "%Y-%m-%dT%H:%M")
        if "end_date" in data:
            telecast.end_date = datetime.strptime(data["end_date"], "%Y-%m-%dT%H:%M")
        if "tech_interruption" in data:
            telecast.tech_interruption = data["tech_interruption"]
        if "total_viewers" in data:
            telecast.total_viewers = data["total_viewers"]

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Telecast updated successfully",
                    "telecast": telecast.to_dict(),
                }
            ),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update telecast", "message": str(e)}), 500


@relations_bp.route("/telecasts/<telecast_id>", methods=["DELETE"])
@jwt_required()
def delete_telecast(telecast_id):
    """Delete telecast (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        telecast = Telecast.query.get(telecast_id)
        if not telecast:
            return jsonify({"error": "Telecast not found"}), 404

        db.session.delete(telecast)
        db.session.commit()

        return jsonify({"message": "Telecast deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete telecast", "message": str(e)}), 500


# ==================== Series Contract ====================


@relations_bp.route("/contracts", methods=["GET"])
def get_all_contracts():
    """Get all series contracts"""
    try:
        from app.models.web_series import WebSeries

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 100, type=int)
        webseries_id = request.args.get("webseries_id", "", type=str)
        status = request.args.get("status", "", type=str)
        search = request.args.get("search", "", type=str)

        query = SeriesContract.query

        # Filter by webseries_id
        if webseries_id:
            query = query.filter(SeriesContract.webseries_id == webseries_id)

        # Filter by status
        if status:
            query = query.filter(SeriesContract.status == status)

        # Search by contract_id or webseries_id
        if search:
            query = query.filter(
                db.or_(
                    SeriesContract.contract_id.like(f"%{search}%"),
                    SeriesContract.webseries_id.like(f"%{search}%")
                )
            )

        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )

        # Enrich with series titles
        result_list = []
        for c in pagination.items:
            item_dict = c.to_dict()
            series = WebSeries.query.get(c.webseries_id)
            item_dict["series_title"] = series.title if series else None
            result_list.append(item_dict)

        return (
            jsonify(
                {
                    "contracts": result_list,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": page,
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": "Failed to fetch contracts", "message": str(e)}), 500


@relations_bp.route("/contracts", methods=["POST"])
@jwt_required()
def create_contract():
    """Create series contract (Employee/Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        required_fields = ["webseries_id", "start_date", "end_date", "contract_status"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Accept either charge_per_episode or contract_amount
        charge = data.get("charge_per_episode") or data.get("contract_amount")
        if not charge:
            return jsonify({"error": "charge_per_episode or contract_amount is required"}), 400

        contract_id = generate_id("CT", 8)

        new_contract = SeriesContract(
            contract_id=contract_id,
            webseries_id=data["webseries_id"],
            signed_date=datetime.strptime(data.get("signed_date", data["start_date"]), "%Y-%m-%d").date(),
            start_date=datetime.strptime(data["start_date"], "%Y-%m-%d").date(),
            end_date=datetime.strptime(data["end_date"], "%Y-%m-%d").date(),
            charge_per_episode=charge,
            status=data["contract_status"],
        )

        db.session.add(new_contract)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Contract created successfully",
                    "contract": new_contract.to_dict(),
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create contract", "message": str(e)}), 500


@relations_bp.route("/contracts/<contract_id>", methods=["PUT"])
@jwt_required()
def update_contract(contract_id):
    """Update series contract (Employee/Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        contract = SeriesContract.query.get(contract_id)
        if not contract:
            return jsonify({"error": "Contract not found"}), 404

        data = request.get_json()

        if "signed_date" in data:
            contract.signed_date = datetime.strptime(data["signed_date"], "%Y-%m-%d").date()
        if "start_date" in data:
            contract.start_date = datetime.strptime(data["start_date"], "%Y-%m-%d").date()
        if "end_date" in data:
            contract.end_date = datetime.strptime(data["end_date"], "%Y-%m-%d").date()
        if "contract_status" in data:
            contract.status = data["contract_status"]
        # Accept either charge_per_episode or contract_amount
        if "charge_per_episode" in data:
            contract.charge_per_episode = data["charge_per_episode"]
        elif "contract_amount" in data:
            contract.charge_per_episode = data["contract_amount"]

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Contract updated successfully",
                    "contract": contract.to_dict(),
                }
            ),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update contract", "message": str(e)}), 500


@relations_bp.route("/contracts/<contract_id>", methods=["DELETE"])
@jwt_required()
def delete_contract(contract_id):
    """Delete series contract (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        contract = SeriesContract.query.get(contract_id)
        if not contract:
            return jsonify({"error": "Contract not found"}), 404

        db.session.delete(contract)
        db.session.commit()

        return jsonify({"message": "Contract deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete contract", "message": str(e)}), 500


# ==================== Subtitle Language ====================


@relations_bp.route("/subtitle-languages", methods=["GET"])
def get_all_subtitle_languages():
    """Get all subtitle languages"""
    try:
        from app.models.web_series import WebSeries

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 100, type=int)
        webseries_id = request.args.get("webseries_id", "", type=str)
        search = request.args.get("search", "", type=str)

        query = SubtitleLanguage.query

        # Filter by webseries_id
        if webseries_id:
            query = query.filter(SubtitleLanguage.webseries_id == webseries_id)

        # Search by webseries_id or language_name
        if search:
            query = query.filter(
                db.or_(
                    SubtitleLanguage.webseries_id.like(f"%{search}%"),
                    SubtitleLanguage.language_name.like(f"%{search}%")
                )
            )

        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )

        # Enrich with series titles
        result_list = []
        for s in pagination.items:
            item_dict = s.to_dict()
            series = WebSeries.query.get(s.webseries_id)
            item_dict["series_title"] = series.title if series else None
            result_list.append(item_dict)

        return (
            jsonify(
                {
                    "subtitle_languages": result_list,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": page,
                }
            ),
            200,
        )
    except Exception as e:
        return (
            jsonify({"error": "Failed to fetch subtitle languages", "message": str(e)}),
            500,
        )


@relations_bp.route("/subtitle-languages", methods=["POST"])
@jwt_required()
def create_subtitle_language():
    """Create subtitle language (Employee/Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        required_fields = ["webseries_id", "language"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Check if already exists
        existing = SubtitleLanguage.query.filter_by(
            webseries_id=data["webseries_id"], language_name=data["language"]
        ).first()
        if existing:
            return jsonify({"error": "Subtitle language already exists"}), 409

        # Generate subtitle_language_id
        subtitle_id = generate_id("SL", 8)

        new_subtitle = SubtitleLanguage(
            subtitle_language_id=subtitle_id,
            webseries_id=data["webseries_id"],
            language_name=data["language"]
        )

        db.session.add(new_subtitle)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Subtitle language created successfully",
                    "subtitle_language": new_subtitle.to_dict(),
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "Failed to create subtitle language", "message": str(e)}),
            500,
        )


@relations_bp.route(
    "/subtitle-languages/<webseries_id>/<language>", methods=["DELETE"]
)
@jwt_required()
def delete_subtitle_language(webseries_id, language):
    """Delete subtitle language (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        subtitle = SubtitleLanguage.query.filter_by(
            webseries_id=webseries_id, language_name=language
        ).first()

        if not subtitle:
            return jsonify({"error": "Subtitle language not found"}), 404

        db.session.delete(subtitle)
        db.session.commit()

        return jsonify({"message": "Subtitle language deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return (
            jsonify({"error": "Failed to delete subtitle language", "message": str(e)}),
            500,
        )


# ==================== Web Series Release ====================


@relations_bp.route("/releases", methods=["GET"])
def get_all_releases():
    """Get all web series releases"""
    try:
        from app.models.web_series import WebSeries

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 100, type=int)
        webseries_id = request.args.get("webseries_id", "", type=str)
        country_name = request.args.get("country_name", "", type=str)
        search = request.args.get("search", "", type=str)

        query = WebSeriesRelease.query

        # Filter by webseries_id
        if webseries_id:
            query = query.filter(WebSeriesRelease.webseries_id == webseries_id)

        # Filter by country_name
        if country_name:
            query = query.filter(WebSeriesRelease.country_name == country_name)

        # Search by webseries_id or country_name
        if search:
            query = query.filter(
                db.or_(
                    WebSeriesRelease.webseries_id.like(f"%{search}%"),
                    WebSeriesRelease.country_name.like(f"%{search}%")
                )
            )

        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )

        # Enrich with series titles
        result_list = []
        for r in pagination.items:
            item_dict = r.to_dict()
            series = WebSeries.query.get(r.webseries_id)
            item_dict["series_title"] = series.title if series else None
            result_list.append(item_dict)

        return (
            jsonify(
                {
                    "releases": result_list,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "current_page": page,
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": "Failed to fetch releases", "message": str(e)}), 500


@relations_bp.route("/releases", methods=["POST"])
@jwt_required()
def create_release():
    """Create web series release (Employee/Admin only)"""
    try:
        from app.models.country import Country

        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        required_fields = ["webseries_id", "country_name", "release_date"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Check if country exists, if not create it
        country = Country.query.get(data["country_name"])
        if not country:
            new_country = Country(country_name=data["country_name"])
            db.session.add(new_country)
            db.session.flush()  # Flush to make it available for the foreign key

        # Check if already exists
        existing = WebSeriesRelease.query.filter_by(
            webseries_id=data["webseries_id"], country_name=data["country_name"]
        ).first()
        if existing:
            return jsonify({"error": "Release already exists"}), 409

        new_release = WebSeriesRelease(
            webseries_id=data["webseries_id"],
            country_name=data["country_name"],
            release_date=datetime.strptime(data["release_date"], "%Y-%m-%d").date(),
        )

        db.session.add(new_release)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Release created successfully",
                    "release": new_release.to_dict(),
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create release", "message": str(e)}), 500


@relations_bp.route("/releases/<webseries_id>/<country_name>", methods=["PUT"])
@jwt_required()
def update_release(webseries_id, country_name):
    """Update web series release (Employee/Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type not in ["Employee", "Admin"]:
            return jsonify({"error": "Unauthorized"}), 403

        release = WebSeriesRelease.query.filter_by(
            webseries_id=webseries_id, country_name=country_name
        ).first()

        if not release:
            return jsonify({"error": "Release not found"}), 404

        data = request.get_json()

        if "release_date" in data:
            release.release_date = datetime.strptime(data["release_date"], "%Y-%m-%d").date()

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Release updated successfully",
                    "release": release.to_dict(),
                }
            ),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update release", "message": str(e)}), 500


@relations_bp.route("/releases/<webseries_id>/<country_name>", methods=["DELETE"])
@jwt_required()
def delete_release(webseries_id, country_name):
    """Delete web series release (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        user = ViewerAccount.query.get(current_user_id)

        if user.account_type != "Admin":
            return jsonify({"error": "Unauthorized"}), 403

        release = WebSeriesRelease.query.filter_by(
            webseries_id=webseries_id, country_name=country_name
        ).first()

        if not release:
            return jsonify({"error": "Release not found"}), 404

        db.session.delete(release)
        db.session.commit()

        return jsonify({"message": "Release deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete release", "message": str(e)}), 500
