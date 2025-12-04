# NEWS Backend - 网络剧集管理系统 API

Flask-based RESTful API for the Web Series Management System.

## Features

-   ✅ JWT Authentication with refresh tokens
-   ✅ Role-based access control (Customer/Employee/Admin)
-   ✅ RESTful API design
-   ✅ SQLAlchemy ORM with MySQL
-   ✅ Password hashing with bcrypt
-   ✅ CORS support
-   ✅ Input validation and sanitization
-   ✅ Database migrations with Flask-Migrate

## Tech Stack

-   **Flask 3.0** - Web framework
-   **SQLAlchemy** - ORM
-   **Flask-JWT-Extended** - JWT authentication
-   **Flask-Bcrypt** - Password hashing
-   **Flask-CORS** - Cross-origin support
-   **PyMySQL** - MySQL connector
-   **Flask-Migrate** - Database migrations

## Quick Start

### 1. Setup Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and update database credentials:

```
DATABASE_URL=mysql+pymysql://your_user:your_password@localhost:3306/news_db
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
```

### 4. Create MySQL Database

```sql
CREATE DATABASE news_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Initialize Database

```bash
# Create all tables
python init_db.py init

# Seed sample data (includes admin and customer accounts)
python init_db.py seed
```

### 6. Run the Server

```bash
python run.py
```

The API will be available at http://localhost:5000

## Test Accounts

After seeding, you can use these accounts:

**Admin Account:**

-   Email: `admin@news.com`
-   Password: `Admin123`
-   Access: Full CRUD operations

**Customer Account:**

-   Email: `john@example.com`
-   Password: `User123`
-   Access: View series, submit feedback

## API Endpoints

### Authentication

| Method | Endpoint             | Description          | Auth          |
| ------ | -------------------- | -------------------- | ------------- |
| POST   | `/api/auth/register` | Register new user    | No            |
| POST   | `/api/auth/login`    | User login           | No            |
| POST   | `/api/auth/refresh`  | Refresh access token | Refresh Token |
| GET    | `/api/auth/me`       | Get current user     | Yes           |

### Series

| Method | Endpoint          | Description        | Auth | Role           |
| ------ | ----------------- | ------------------ | ---- | -------------- |
| GET    | `/api/series`     | Get all series     | No   | -              |
| GET    | `/api/series/:id` | Get series details | No   | -              |
| POST   | `/api/series`     | Create series      | Yes  | Employee/Admin |
| PUT    | `/api/series/:id` | Update series      | Yes  | Employee/Admin |
| DELETE | `/api/series/:id` | Delete series      | Yes  | Admin          |

### Episodes

| Method | Endpoint            | Description         | Auth | Role           |
| ------ | ------------------- | ------------------- | ---- | -------------- |
| GET    | `/api/episodes`     | Get all episodes    | No   | -              |
| GET    | `/api/episodes/:id` | Get episode details | No   | -              |
| POST   | `/api/episodes`     | Create episode      | Yes  | Employee/Admin |
| PUT    | `/api/episodes/:id` | Update episode      | Yes  | Employee/Admin |
| DELETE | `/api/episodes/:id` | Delete episode      | Yes  | Admin          |

### Feedback

| Method | Endpoint            | Description      | Auth | Role        |
| ------ | ------------------- | ---------------- | ---- | ----------- |
| GET    | `/api/feedback`     | Get all feedback | No   | -           |
| POST   | `/api/feedback`     | Submit feedback  | Yes  | Customer    |
| PUT    | `/api/feedback/:id` | Update feedback  | Yes  | Owner       |
| DELETE | `/api/feedback/:id` | Delete feedback  | Yes  | Owner/Admin |

### Production Houses

| Method | Endpoint                     | Description       | Auth | Role  |
| ------ | ---------------------------- | ----------------- | ---- | ----- |
| GET    | `/api/production-houses`     | Get all houses    | No   | -     |
| GET    | `/api/production-houses/:id` | Get house details | No   | -     |
| POST   | `/api/production-houses`     | Create house      | Yes  | Admin |
| PUT    | `/api/production-houses/:id` | Update house      | Yes  | Admin |
| DELETE | `/api/production-houses/:id` | Delete house      | Yes  | Admin |

## Database Models

The system includes 13 interconnected tables:

1. `country` - Countries
2. `production_house` - Production companies
3. `producer` - Producers
4. `producer_affiliation` - Producer-house relationships
5. `web_series` - Main series table
6. `episode` - Episodes
7. `telecast` - Broadcasting information
8. `series_contract` - Contracts
9. `viewer_account` - User accounts
10. `feedback` - User reviews
11. `dubbing_language` - Dubbing languages
12. `subtitle_language` - Subtitle languages
13. `web_series_release` - Release information

## Security Features

-   **Password Hashing**: bcrypt with 12 rounds
-   **JWT Tokens**: 1-hour access token, 30-day refresh token
-   **Input Sanitization**: XSS prevention
-   **SQL Injection Protection**: SQLAlchemy ORM
-   **Role-Based Access**: Customer, Employee, Admin
-   **CORS Configuration**: Whitelist allowed origins

## Development Commands

```bash
# Initialize database
python init_db.py init

# Seed sample data
python init_db.py seed

# Reset database (drop + recreate + seed)
python init_db.py reset

# Run Flask shell
flask shell

# Database migrations
flask db init
flask db migrate -m "message"
flask db upgrade
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # App factory
│   ├── models/              # Database models (13 files)
│   ├── routes/              # API routes
│   │   ├── auth.py         # Authentication
│   │   ├── series.py       # Series endpoints
│   │   ├── episode.py      # Episode endpoints
│   │   ├── feedback.py     # Feedback endpoints
│   │   └── production_house.py
│   └── utils/
│       └── security.py      # Security utilities
├── config.py                # Configuration
├── run.py                   # Application entry point
├── init_db.py              # Database initialization
└── requirements.txt         # Python dependencies
```

## Error Handling

All endpoints return consistent error responses:

```json
{
	"error": "Error type",
	"message": "Detailed error message"
}
```

HTTP Status Codes:

-   200: Success
-   201: Created
-   400: Bad Request
-   401: Unauthorized
-   403: Forbidden
-   404: Not Found
-   409: Conflict
-   500: Internal Server Error

## Testing

Use tools like Postman or curl to test the API:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@news.com", "password": "Admin123"}'

# Get series (with token)
curl http://localhost:5000/api/series \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## License

MIT
