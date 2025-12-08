#!/usr/bin/env python3
"""
Database initialization script
Creates all tables and optionally seeds sample data
"""
from app import create_app, db
from app.models import *
from datetime import date

app = create_app("development")


def init_database():
    """Initialize database with tables"""
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("✓ Database tables created successfully!")


def seed_sample_data():
    """Seed database with sample data"""
    with app.app_context():
        print("\nSeeding sample data...")

        # Create countries
        countries = ["USA", "China", "UK", "Japan", "South Korea"]
        for country_name in countries:
            if not Country.query.get(country_name):
                country = Country(country_name=country_name)
                db.session.add(country)
        db.session.commit()
        print("✓ Countries seeded")

        # Create production houses
        houses_data = [
            {
                "house_id": "PH001",
                "name": "Netflix Productions",
                "year_established": "2010",
                "street": "100 Winchester Circle",
                "city": "Los Gatos",
                "state": "California",
                "nationality": "USA",
            },
            {
                "house_id": "PH002",
                "name": "HBO Entertainment",
                "year_established": "1972",
                "street": "1100 Avenue of the Americas",
                "city": "New York",
                "state": "New York",
                "nationality": "USA",
            },
            {
                "house_id": "PH003",
                "name": "Amazon Studios",
                "year_established": "2010",
                "street": "410 Terry Avenue North",
                "city": "Seattle",
                "state": "Washington",
                "nationality": "USA",
            },
        ]

        for house_data in houses_data:
            if not ProductionHouse.query.get(house_data["house_id"]):
                house = ProductionHouse(**house_data)
                db.session.add(house)
        db.session.commit()
        print("✓ Production houses seeded")

        # Create web series
        series_data = [
            {
                "webseries_id": "WS001",
                "title": "Stranger Things",
                "num_episodes": 34,
                "type": "Sci-Fi",
                "house_id": "PH001",
            },
            {
                "webseries_id": "WS002",
                "title": "Breaking Bad",
                "num_episodes": 62,
                "type": "Drama",
                "house_id": "PH002",
            },
            {
                "webseries_id": "WS003",
                "title": "The Boys",
                "num_episodes": 32,
                "type": "Action",
                "house_id": "PH003",
            },
            {
                "webseries_id": "WS004",
                "title": "The Crown",
                "num_episodes": 50,
                "type": "Drama",
                "house_id": "PH001",
            },
            {
                "webseries_id": "WS005",
                "title": "Wednesday",
                "num_episodes": 8,
                "type": "Comedy",
                "house_id": "PH001",
            },
            {
                "webseries_id": "WS006",
                "title": "The Witcher",
                "num_episodes": 24,
                "type": "Fantasy",
                "house_id": "PH001",
            },
            {
                "webseries_id": "WS007",
                "title": "The Mandalorian",
                "num_episodes": 24,
                "type": "Sci-Fi",
                "house_id": "PH003",
            },
            {
                "webseries_id": "WS008",
                "title": "Game of Thrones",
                "num_episodes": 73,
                "type": "Fantasy",
                "house_id": "PH002",
            },
            {
                "webseries_id": "WS009",
                "title": "The Last of Us",
                "num_episodes": 9,
                "type": "Drama",
                "house_id": "PH002",
            },
            {
                "webseries_id": "WS010",
                "title": "Squid Game",
                "num_episodes": 9,
                "type": "Thriller",
                "house_id": "PH001",
            },
            {
                "webseries_id": "WS011",
                "title": "House of the Dragon",
                "num_episodes": 18,
                "type": "Fantasy",
                "house_id": "PH002",
            },
            {
                "webseries_id": "WS012",
                "title": "The Office",
                "num_episodes": 201,
                "type": "Comedy",
                "house_id": "PH001",
            },
        ]

        for series in series_data:
            if not WebSeries.query.get(series["webseries_id"]):
                ws = WebSeries(**series)
                db.session.add(ws)
        db.session.commit()
        print("✓ Web series seeded")

        # Create episodes for all series
        episodes_config = [
            ("WS001", "Stranger Things", 34, ["Chapter One: The Vanishing", "Chapter Two: The Weirdo", "Chapter Three: Holly Jolly", "Chapter Four: The Body", "Chapter Five: The Flea and the Acrobat"]),
            ("WS002", "Breaking Bad", 62, ["Pilot", "Cat's in the Bag", "And the Bag's in the River", "Cancer Man", "Gray Matter"]),
            ("WS003", "The Boys", 32, ["The Name of the Game", "Cherry", "Get Some", "The Female of the Species", "Good for the Soul"]),
            ("WS004", "The Crown", 50, ["Wolferton Splash", "Hyde Park Corner", "Windsor", "Act of God", "Smoke and Mirrors"]),
            ("WS005", "Wednesday", 8, ["Wednesday's Child Is Full of Woe", "Woe Is the Loneliest Number", "Friend or Woe", "Woe What a Night", "You Reap What You Woe", "Quid Pro Woe", "If You Don't Woe Me By Now", "A Murder of Woes"]),
            ("WS006", "The Witcher", 24, ["The End's Beginning", "Four Marks", "Betrayer Moon", "Of Banquets, Bastards and Burials", "Bottled Appetites"]),
            ("WS007", "The Mandalorian", 24, ["Chapter 1: The Mandalorian", "Chapter 2: The Child", "Chapter 3: The Sin", "Chapter 4: Sanctuary", "Chapter 5: The Gunslinger"]),
            ("WS008", "Game of Thrones", 73, ["Winter Is Coming", "The Kingsroad", "Lord Snow", "Cripples, Bastards, and Broken Things", "The Wolf and the Lion"]),
            ("WS009", "The Last of Us", 9, ["When You're Lost in the Darkness", "Infected", "Long, Long Time", "Please Hold to My Hand", "Endure and Survive", "Kin", "Left Behind", "When We Are in Need", "Look for the Light"]),
            ("WS010", "Squid Game", 9, ["Red Light, Green Light", "Hell", "The Man with the Umbrella", "Stick to the Team", "A Fair World", "Gganbu", "VIPS", "Front Man", "One Lucky Day"]),
            ("WS011", "House of the Dragon", 18, ["The Heirs of the Dragon", "The Rogue Prince", "Second of His Name", "King of the Narrow Sea", "We Light the Way"]),
            ("WS012", "The Office", 10, ["Pilot", "Diversity Day", "Health Care", "The Alliance", "Basketball"]),
        ]

        episode_counter = 1
        for ws_id, series_title, total_eps, episode_titles in episodes_config:
            for i, ep_title in enumerate(episode_titles, 1):
                episode_id = f"EP{str(episode_counter).zfill(6)}"
                if not Episode.query.get(episode_id):
                    episode = Episode(
                        episode_id=episode_id,
                        episode_number=str(i),
                        title=ep_title,
                        webseries_id=ws_id,
                        duration_minutes=45 if ws_id != "WS012" else 22,  # The Office has shorter episodes
                        release_date=date(2024, 1, min(i, 28)),
                    )
                    db.session.add(episode)
                episode_counter += 1
        db.session.commit()
        print("✓ Episodes seeded")

        # Create producers
        producers_data = [
            {
                "producer_id": "PR001",
                "first_name": "Matt",
                "last_name": "Duffer",
                "phone": 3105551234,
                "street": "100 Universal City Plaza",
                "city": "Universal City",
                "state": "CA",
                "email": "matt.duffer@netflix.com",
                "nationality": "USA"
            },
            {
                "producer_id": "PR002",
                "first_name": "Ross",
                "last_name": "Duffer",
                "phone": 3105551235,
                "street": "100 Universal City Plaza",
                "city": "Universal City",
                "state": "CA",
                "email": "ross.duffer@netflix.com",
                "nationality": "USA"
            },
            {
                "producer_id": "PR003",
                "first_name": "Vince",
                "last_name": "Gilligan",
                "phone": 2125551236,
                "street": "30 Rockefeller Plaza",
                "city": "New York",
                "state": "NY",
                "email": "vince@hbo.com",
                "nationality": "USA"
            },
            {
                "producer_id": "PR004",
                "first_name": "Eric",
                "last_name": "Kripke",
                "phone": 2065551237,
                "street": "410 Terry Ave N",
                "city": "Seattle",
                "state": "WA",
                "email": "eric.kripke@amazon.com",
                "nationality": "USA"
            },
            {
                "producer_id": "PR005",
                "first_name": "Peter",
                "last_name": "Morgan",
                "phone": 4425551238,
                "street": "Baker Street",
                "city": "London",
                "state": "England",
                "email": "peter.morgan@netflix.com",
                "nationality": "UK"
            },
        ]

        for prod_data in producers_data:
            if not Producer.query.get(prod_data["producer_id"]):
                producer = Producer(**prod_data)
                db.session.add(producer)
        db.session.commit()
        print("✓ Producers seeded")

        # Create producer affiliations
        affiliations_data = [
            {"producer_id": "PR001", "house_id": "PH001", "start_date": date(2015, 1, 1), "end_date": None},
            {"producer_id": "PR002", "house_id": "PH001", "start_date": date(2015, 1, 1), "end_date": None},
            {"producer_id": "PR003", "house_id": "PH002", "start_date": date(2008, 1, 1), "end_date": date(2013, 9, 29)},
            {"producer_id": "PR004", "house_id": "PH003", "start_date": date(2019, 1, 1), "end_date": None},
            {"producer_id": "PR005", "house_id": "PH001", "start_date": date(2016, 1, 1), "end_date": None},
        ]

        for aff_data in affiliations_data:
            # Check if affiliation already exists
            existing = ProducerAffiliation.query.filter_by(
                producer_id=aff_data["producer_id"],
                house_id=aff_data["house_id"],
                start_date=aff_data["start_date"]
            ).first()
            if not existing:
                affiliation = ProducerAffiliation(**aff_data)
                db.session.add(affiliation)
        db.session.commit()
        print("✓ Producer affiliations seeded")

        # Create dubbing languages
        dubbing_data = [
            ("DL001", "English", "WS001"),
            ("DL002", "Spanish", "WS001"),
            ("DL003", "French", "WS001"),
            ("DL004", "English", "WS002"),
            ("DL005", "Spanish", "WS002"),
            ("DL006", "English", "WS003"),
            ("DL007", "English", "WS010"),
            ("DL008", "Korean", "WS010"),
            ("DL009", "Japanese", "WS010"),
        ]

        for dl_id, lang_name, ws_id in dubbing_data:
            if not DubbingLanguage.query.get(dl_id):
                dubbing = DubbingLanguage(
                    dubbing_language_id=dl_id,
                    language_name=lang_name,
                    webseries_id=ws_id
                )
                db.session.add(dubbing)
        db.session.commit()
        print("✓ Dubbing languages seeded")

        # Create subtitle languages
        subtitle_data = [
            ("SL001", "English", "WS001"),
            ("SL002", "Spanish", "WS001"),
            ("SL003", "French", "WS001"),
            ("SL004", "German", "WS001"),
            ("SL005", "English", "WS002"),
            ("SL006", "Spanish", "WS002"),
            ("SL007", "English", "WS010"),
            ("SL008", "Korean", "WS010"),
            ("SL009", "Chinese", "WS010"),
        ]

        for sl_id, lang_name, ws_id in subtitle_data:
            if not SubtitleLanguage.query.get(sl_id):
                subtitle = SubtitleLanguage(
                    subtitle_language_id=sl_id,
                    language_name=lang_name,
                    webseries_id=ws_id
                )
                db.session.add(subtitle)
        db.session.commit()
        print("✓ Subtitle languages seeded")

        # Create web series releases
        release_data = [
            ("WS001", "USA", date(2016, 7, 15)),
            ("WS001", "UK", date(2016, 7, 15)),
            ("WS001", "China", date(2016, 8, 1)),
            ("WS002", "USA", date(2008, 1, 20)),
            ("WS003", "USA", date(2019, 7, 26)),
            ("WS010", "South Korea", date(2021, 9, 17)),
            ("WS010", "USA", date(2021, 9, 17)),
            ("WS010", "Japan", date(2021, 9, 17)),
        ]

        for ws_id, country, rel_date in release_data:
            existing = WebSeriesRelease.query.filter_by(
                webseries_id=ws_id,
                country_name=country
            ).first()
            if not existing:
                release = WebSeriesRelease(
                    webseries_id=ws_id,
                    country_name=country,
                    release_date=rel_date
                )
                db.session.add(release)
        db.session.commit()
        print("✓ Web series releases seeded")

        # Create admin user
        admin_id = "ADMIN001"
        if not ViewerAccount.query.get(admin_id):
            admin = ViewerAccount(
                account_id=admin_id,
                first_name="Admin",
                last_name="User",
                email="admin@news.com",
                street="123 Admin St",
                city="New York",
                state="NY",
                country_name="USA",
                open_date=date.today(),
                monthly_service_charge=0.00,
                account_type="Admin",
                is_active=True,
            )
            admin.set_password("Admin123")
            db.session.add(admin)
            db.session.commit()
            print("✓ Admin user created (email: admin@news.com, password: Admin123)")

        # Create sample customer
        customer_id = "CUST001"
        if not ViewerAccount.query.get(customer_id):
            customer = ViewerAccount(
                account_id=customer_id,
                first_name="John",
                last_name="Doe",
                email="john@example.com",
                street="456 User Ave",
                city="Los Angeles",
                state="CA",
                country_name="USA",
                open_date=date.today(),
                monthly_service_charge=9.99,
                account_type="Customer",
                is_active=True,
            )
            customer.set_password("User123")
            db.session.add(customer)
            db.session.commit()
            print("✓ Sample customer created (email: john@example.com, password: User123)")

        # Create more sample customers for feedback
        more_customers = [
            ("CUST002", "Jane", "Smith", "jane@example.com", "User123"),
            ("CUST003", "Mike", "Johnson", "mike@example.com", "User123"),
            ("CUST004", "Sarah", "Williams", "sarah@example.com", "User123"),
            ("CUST005", "Tom", "Brown", "tom@example.com", "User123"),
        ]

        for cust_id, fname, lname, email, pwd in more_customers:
            if not ViewerAccount.query.get(cust_id):
                customer = ViewerAccount(
                    account_id=cust_id,
                    first_name=fname,
                    last_name=lname,
                    email=email,
                    street="123 Main St",
                    city="New York",
                    state="NY",
                    country_name="USA",
                    open_date=date.today(),
                    monthly_service_charge=9.99,
                    account_type="Customer",
                    is_active=True,
                )
                customer.set_password(pwd)
                db.session.add(customer)
        db.session.commit()
        print("✓ Additional customers created")

        # Create feedback
        feedback_data = [
            ("FB001", 5, "Amazing show! Best sci-fi series I've ever watched.", date(2024, 2, 1), "CUST001", "WS001"),
            ("FB002", 4, "Great storytelling and character development.", date(2024, 2, 5), "CUST002", "WS001"),
            ("FB003", 5, "One of the best dramas ever made. Highly recommended!", date(2024, 2, 10), "CUST003", "WS002"),
            ("FB004", 4, "Intense and thrilling. Love the action scenes.", date(2024, 2, 12), "CUST001", "WS003"),
            ("FB005", 5, "Beautiful cinematography and excellent acting.", date(2024, 2, 15), "CUST004", "WS004"),
            ("FB006", 5, "Wednesday is hilarious! Love the dark humor.", date(2024, 2, 18), "CUST002", "WS005"),
            ("FB007", 4, "The Witcher is epic! Great adaptation.", date(2024, 2, 20), "CUST005", "WS006"),
            ("FB008", 5, "Baby Yoda is adorable! This is the way.", date(2024, 2, 22), "CUST003", "WS007"),
            ("FB009", 5, "GoT is a masterpiece. Best fantasy series.", date(2024, 2, 25), "CUST004", "WS008"),
            ("FB010", 5, "The Last of Us is emotionally powerful.", date(2024, 2, 28), "CUST005", "WS009"),
            ("FB011", 5, "Squid Game is intense! Couldn't stop watching.", date(2024, 3, 1), "CUST001", "WS010"),
            ("FB012", 4, "House of the Dragon lives up to the hype.", date(2024, 3, 5), "CUST002", "WS011"),
            ("FB013", 5, "The Office never gets old. Classic comedy!", date(2024, 3, 10), "CUST003", "WS012"),
        ]

        for fb_id, rating, text, fb_date, acc_id, ws_id in feedback_data:
            if not Feedback.query.get(fb_id):
                feedback = Feedback(
                    feedback_id=fb_id,
                    rating=rating,
                    feedback_text=text,
                    feedback_date=fb_date,
                    account_id=acc_id,
                    webseries_id=ws_id
                )
                db.session.add(feedback)
        db.session.commit()
        print("✓ Feedback seeded")

        # Create series contracts
        contracts_data = [
            ("CT001", "Active", date(2015, 12, 1), date(2016, 1, 1), date(2026, 12, 31), 5000.00, "WS001"),
            ("CT002", "Active", date(2007, 12, 1), date(2008, 1, 1), date(2025, 12, 31), 7500.00, "WS002"),
            ("CT003", "Active", date(2018, 12, 1), date(2019, 1, 1), date(2027, 12, 31), 6000.00, "WS003"),
            ("CT004", "Expired", date(2015, 12, 1), date(2016, 1, 1), date(2023, 12, 31), 4500.00, "WS004"),
            ("CT005", "Active", date(2021, 12, 1), date(2022, 1, 1), date(2028, 12, 31), 8000.00, "WS005"),
        ]

        for ct_id, status, signed, start, end, charge, ws_id in contracts_data:
            if not SeriesContract.query.get(ct_id):
                contract = SeriesContract(
                    contract_id=ct_id,
                    status=status,
                    signed_date=signed,
                    start_date=start,
                    end_date=end,
                    charge_per_episode=charge,
                    webseries_id=ws_id
                )
                db.session.add(contract)
        db.session.commit()
        print("✓ Series contracts seeded")

        # Create telecasts
        from datetime import datetime
        telecast_data = [
            ("TC001", datetime(2016, 7, 15, 10, 0), datetime(2024, 7, 15, 11, 0), "N", 5000000, "EP000001"),
            ("TC002", datetime(2016, 7, 15, 10, 0), datetime(2024, 7, 15, 11, 0), "N", 4800000, "EP000002"),
            ("TC003", datetime(2008, 1, 20, 21, 0), datetime(2013, 9, 29, 22, 0), "N", 10000000, "EP000006"),
            ("TC004", datetime(2019, 7, 26, 9, 0), datetime(2024, 7, 26, 10, 0), "N", 6500000, "EP000011"),
            ("TC005", datetime(2022, 11, 23, 8, 0), datetime(2023, 11, 23, 9, 0), "N", 7200000, "EP000021"),
        ]

        for tc_id, start, end, interrupt, viewers, ep_id in telecast_data:
            if not Telecast.query.get(tc_id):
                telecast = Telecast(
                    telecast_id=tc_id,
                    start_date=start,
                    end_date=end,
                    tech_interruption=interrupt,
                    total_viewers=viewers,
                    episode_id=ep_id
                )
                db.session.add(telecast)
        db.session.commit()
        print("✓ Telecasts seeded")

        print("\n✅ Sample data seeded successfully!")
        print("\nTest Accounts:")
        print("  Admin: admin@news.com / Admin123")
        print("  Customer: john@example.com / User123")
        print("\nDatabase Statistics:")
        print(f"  Web Series: {WebSeries.query.count()}")
        print(f"  Episodes: {Episode.query.count()}")
        print(f"  Feedback: {Feedback.query.count()}")
        print(f"  Users: {ViewerAccount.query.count()}")


def drop_all_tables():
    """Drop all database tables (USE WITH CAUTION!)"""
    with app.app_context():
        print("⚠️  WARNING: This will delete all database tables!")
        confirm = input("Type 'YES' to confirm: ")
        if confirm == "YES":
            db.drop_all()
            print("✓ All tables dropped")
        else:
            print("✗ Operation cancelled")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "init":
            init_database()
        elif command == "seed":
            seed_sample_data()
        elif command == "reset":
            drop_all_tables()
            init_database()
            seed_sample_data()
        else:
            print(f"Unknown command: {command}")
            print("Available commands: init, seed, reset")
    else:
        print("Database Initialization Script")
        print("\nUsage:")
        print("  python init_db.py init   - Create database tables")
        print("  python init_db.py seed   - Seed sample data")
        print("  python init_db.py reset  - Drop all tables and recreate with sample data")
