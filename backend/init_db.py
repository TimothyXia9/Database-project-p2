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
                "num_episodes": 42,
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
        ]

        for series in series_data:
            if not WebSeries.query.get(series["webseries_id"]):
                ws = WebSeries(**series)
                db.session.add(ws)
        db.session.commit()
        print("✓ Web series seeded")

        # Create sample episodes for first series
        for i in range(1, 6):
            episode_id = f"EP{str(i).zfill(3)}"
            if not Episode.query.get(episode_id):
                episode = Episode(
                    episode_id=episode_id,
                    episode_number=str(i),
                    title=f"Episode {i}",
                    webseries_id="WS001",
                    duration_minutes=45,
                    release_date=date(2024, 1, i),
                )
                db.session.add(episode)
        db.session.commit()
        print("✓ Episodes seeded")

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

        print("\n✅ Sample data seeded successfully!")
        print("\nTest Accounts:")
        print("  Admin: admin@news.com / Admin123")
        print("  Customer: john@example.com / User123")


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
