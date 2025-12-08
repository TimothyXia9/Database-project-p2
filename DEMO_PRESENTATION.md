# NEWS Demo Presentation

## Overview

### Tech Stack

```
Frontend: React 18 + Redux Toolkit + Material-UI
Backend: Flask 3.0 + SQLAlchemy 2.0 + JWT
Database: MySQL 8.0 (13 related tables)
Cache: Redis
Deployment: Docker Compose + Nginx
```

### Database

#### 1. web_series

| Field          | Type        | Constraints  |
| -------------- | ----------- | ------------ |
| webseries_id   | VARCHAR(10) | PRIMARY KEY  |
| title          | VARCHAR(64) | NOT NULL     |
| num_episodes   | INT         | NOT NULL     |
| type           | VARCHAR(15) | NOT NULL     |
| house_id       | VARCHAR(10) | NOT NULL, FK |
| **created_at** | TIMESTAMP   | NOT NULL     |
| **updated_at** | TIMESTAMP   | NOT NULL     |

#### 2. episode

| Field          | Type        | Constraints  |
| -------------- | ----------- | ------------ |
| episode_id     | VARCHAR(10) | PRIMARY KEY  |
| episode_number | VARCHAR(10) | NOT NULL     |
| title          | VARCHAR(64) |              |
| webseries_id   | VARCHAR(10) | NOT NULL, FK |
| **created_at** | TIMESTAMP   | NOT NULL     |
| **updated_at** | TIMESTAMP   | NOT NULL     |

#### 3. feedback

| Field          | Type         | Constraints          |
| -------------- | ------------ | -------------------- |
| feedback_id    | VARCHAR(10)  | PRIMARY KEY          |
| rating         | TINYINT      | NOT NULL, CHECK(1-5) |
| feedback_text  | VARCHAR(128) | NOT NULL             |
| feedback_date  | DATE         | NOT NULL             |
| account_id     | VARCHAR(10)  | NOT NULL, FK         |
| webseries_id   | VARCHAR(10)  | NOT NULL, FK         |
| **created_at** | TIMESTAMP    | NOT NULL             |
| **updated_at** | TIMESTAMP    | NOT NULL             |

#### 4. viewer_account

| Field                  | Type          | Constraints      |
| ---------------------- | ------------- | ---------------- |
| account_id             | VARCHAR(10)   | PRIMARY KEY      |
| **email**              | VARCHAR(64)   | NOT NULL, UNIQUE |
| **password_hash**      | VARCHAR(128)  | NOT NULL         |
| **role**               | VARCHAR(16)   | NOT NULL         |
| first_name             | VARCHAR(30)   | NOT NULL         |
| middle_name            | VARCHAR(30)   |                  |
| last_name              | VARCHAR(30)   | NOT NULL         |
| street                 | VARCHAR(64)   | NOT NULL         |
| city                   | VARCHAR(64)   | NOT NULL         |
| state                  | VARCHAR(64)   | NOT NULL         |
| open_date              | DATE          | NOT NULL         |
| monthly_service_charge | DECIMAL(10,2) | NOT NULL         |
| country_name           | VARCHAR(64)   | NOT NULL, FK     |
| **created_at**         | TIMESTAMP     | NOT NULL         |
| **updated_at**         | TIMESTAMP     | NOT NULL         |

#### 5. production_house

| Field            | Type        | Constraints |
| ---------------- | ----------- | ----------- |
| house_id         | VARCHAR(10) | PRIMARY KEY |
| name             | VARCHAR(64) | NOT NULL    |
| year_established | VARCHAR(10) | NOT NULL    |
| street           | VARCHAR(64) | NOT NULL    |
| city             | VARCHAR(64) | NOT NULL    |
| state            | VARCHAR(64) | NOT NULL    |
| nationality      | VARCHAR(20) | NOT NULL    |
| **created_at**   | TIMESTAMP   | NOT NULL    |
| **updated_at**   | TIMESTAMP   | NOT NULL    |

#### 6. producer

| Field          | Type        | Constraints      |
| -------------- | ----------- | ---------------- |
| producer_id    | VARCHAR(10) | PRIMARY KEY      |
| first_name     | VARCHAR(64) | NOT NULL         |
| middle_name    | VARCHAR(64) |                  |
| last_name      | VARCHAR(64) | NOT NULL         |
| phone          | VARCHAR(15) | NOT NULL         |
| street         | VARCHAR(64) | NOT NULL         |
| city           | VARCHAR(64) | NOT NULL         |
| state          | VARCHAR(32) | NOT NULL         |
| email          | VARCHAR(64) | NOT NULL, UNIQUE |
| nationality    | VARCHAR(20) | NOT NULL         |
| **created_at** | TIMESTAMP   | NOT NULL         |
| **updated_at** | TIMESTAMP   | NOT NULL         |

#### 7. producer_affiliation

| Field          | Type        | Constraints     |
| -------------- | ----------- | --------------- |
| producer_id    | VARCHAR(10) | PRIMARY KEY, FK |
| house_id       | VARCHAR(10) | PRIMARY KEY, FK |
| start_date     | DATE        | NOT NULL        |
| end_date       | DATE        |                 |
| **created_at** | TIMESTAMP   | NOT NULL        |
| **updated_at** | TIMESTAMP   | NOT NULL        |

#### 8. series_contract

| Field              | Type         | Constraints   |
| ------------------ | ------------ | ------------- |
| contract_id        | VARCHAR(10)  | PRIMARY KEY   |
| webseries_id       | VARCHAR(10)  | NOT NULL, FK  |
| signed_date        | DATE         | NOT NULL      |
| start_date         | DATE         | NOT NULL      |
| end_date           | DATE         | NOT NULL      |
| charge_per_episode | DECIMAL(7,2) | NOT NULL, > 0 |
| status             | VARCHAR(16)  | NOT NULL      |
| **created_at**     | TIMESTAMP    | NOT NULL      |
| **updated_at**     | TIMESTAMP    | NOT NULL      |

#### 9. telecast

| Field             | Type        | Constraints    |
| ----------------- | ----------- | -------------- |
| telecast_id       | VARCHAR(10) | PRIMARY KEY    |
| episode_id        | VARCHAR(10) | NOT NULL, FK   |
| start_date        | DATE        | NOT NULL       |
| end_date          | DATE        | NOT NULL       |
| tech_interruption | CHAR(1)     | NOT NULL, Y/N  |
| total_viewers     | BIGINT      | NOT NULL, >= 0 |
| **created_at**    | TIMESTAMP   | NOT NULL       |
| **updated_at**    | TIMESTAMP   | NOT NULL       |

#### 10. dubbing_language

| Field               | Type        | Constraints  |
| ------------------- | ----------- | ------------ |
| dubbing_language_id | VARCHAR(10) | PRIMARY KEY  |
| language_name       | VARCHAR(20) | NOT NULL     |
| webseries_id        | VARCHAR(10) | NOT NULL, FK |
| **created_at**      | TIMESTAMP   | NOT NULL     |
| **updated_at**      | TIMESTAMP   | NOT NULL     |

#### 11. subtitle_language

| Field                | Type        | Constraints  |
| -------------------- | ----------- | ------------ |
| subtitle_language_id | VARCHAR(10) | PRIMARY KEY  |
| language_name        | VARCHAR(20) | NOT NULL     |
| webseries_id         | VARCHAR(10) | NOT NULL, FK |
| **created_at**       | TIMESTAMP   | NOT NULL     |
| **updated_at**       | TIMESTAMP   | NOT NULL     |

#### 12. web_series_release

| Field          | Type        | Constraints     |
| -------------- | ----------- | --------------- |
| webseries_id   | VARCHAR(10) | PRIMARY KEY, FK |
| country_name   | VARCHAR(64) | PRIMARY KEY, FK |
| release_date   | DATE        | NOT NULL        |
| **created_at** | TIMESTAMP   | NOT NULL        |
| **updated_at** | TIMESTAMP   | NOT NULL        |

#### 13. country

| Field        | Type        | Constraints |
| ------------ | ----------- | ----------- |
| country_name | VARCHAR(64) | PRIMARY KEY |

---

### User Roles

-   **Customer**: Browse series, submit feedback
-   **Employee**: Create, Read, Update contents and relations, except user management
-   **Admin**: Full CRUD permissions, user management

```
Register → JWT Token → Authorization → Role Verification
```

---

## Security Features

### Password Encryption

```python
# bcrypt encryption with 12 rounds
bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12))
```

### SQL Injection Protection

#### 1. SQLAlchemy ORM

```python
# 100% using SQLAlchemy ORM
series = WebSeries.query.filter_by(webseries_id=series_id).first()

# Safe search with parameterized queries
if search:
    query = query.filter(
        or_(
            WebSeries.title.contains(search),
            WebSeries.webseries_id.contains(search)
        )
    )
```

**Generated SQL** (always parameterized):

```sql
SELECT * FROM web_series
WHERE title LIKE ? OR webseries_id LIKE ?
-- Parameters: ['%search_input%', '%search_input%']
```

**Attack Prevention:**

-   User input: `' OR '1'='1`
-   Database sees: `title LIKE '%' OR '1'='1%'` (as literal string, not SQL)
-   Result: No matches

#### 2. Stored Procedures

Stored procedures add **database-level validation** before operations:

```sql
CALL sp_create_web_series('Breaking Bad', 'Drama', 'PH001', @id, @err);
```

**Available Stored Procedures (7 total):**

| Procedure                     | Purpose                              | Safety Features                                             |
| ----------------------------- | ------------------------------------ | ----------------------------------------------------------- |
| **sp_create_web_series**      | Create series with validation        | Validates production house exists, generates unique ID      |
| **sp_submit_feedback**        | Submit feedback with duplicate check | Validates rating (1-5), prevents duplicate reviews per user |
| **sp_create_episode**         | Create episode with conflict check   | Prevents duplicate episode numbers                          |
| **sp_get_series_stats**       | Complex aggregate query              | Safe JOIN operations with GROUP BY                          |
| **sp_get_top_rated_series**   | Get highly-rated series              | Safe aggregation with HAVING clause                         |
| **sp_cleanup_expired_tokens** | Clean up password reset tokens       | Removes expired/used tokens safely                          |
| **sp_get_user_activity**      | User activity summary                | Safe aggregation without exposing sensitive data            |

**Example: sp_create_web_series in Action**

```sql
CREATE PROCEDURE sp_create_web_series(
    IN p_title VARCHAR(64),
    IN p_type VARCHAR(15),
    IN p_house_id VARCHAR(10),
    OUT p_series_id VARCHAR(10),
    OUT p_error_msg VARCHAR(255)
)
BEGIN
    DECLARE v_house_exists INT;

    -- Error handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_error_msg = 'Database error occurred';
    END;

    START TRANSACTION;

    -- Step 1: Validate production house
    SELECT COUNT(*) INTO v_house_exists
    FROM production_house WHERE house_id = p_house_id;

    IF v_house_exists = 0 THEN
        SET p_error_msg = 'Production house does not exist';
        ROLLBACK;
    ELSE
        -- Step 2: Generate unique ID
        SET p_series_id = CONCAT('WS', LPAD(FLOOR(RAND() * 100000000), 8, '0'));

        -- Step 3: Ensure uniqueness
        WHILE EXISTS(SELECT 1 FROM web_series WHERE webseries_id = p_series_id) DO
            SET p_series_id = CONCAT('WS', LPAD(FLOOR(RAND() * 100000000), 8, '0'));
        END WHILE;

        -- Step 4: Insert with all parameters validated
        INSERT INTO web_series (webseries_id, title, num_episodes, type, house_id, **created_at**, **updated_at**)
        VALUES (p_series_id, p_title, 0, p_type, p_house_id, NOW(), NOW());

        COMMIT;
    END IF;
END//
```

**Security Benefits:**

-   Parameterized input (no string concatenation)
-   Type constraints (VARCHAR lengths limit data)
-   Business logic validation (checks foreign keys)

### XSS Protection

```python
# All user inputs are HTML escaped
def sanitize_input(text):
    text = html.escape(text)  # HTML entity escaping
    text = re.sub(r"<script.*?</script>", "", text)  # Remove scripts
    return text
```

```
Test 1: Normal Text
Input:  This is a normal comment
Output: This is a normal comment

Test 2: Basic Script Tag
Input:  <script>alert('XSS')</script>
Output: &lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;

Test 3: Script with Attributes
Input:  <script src='malicious.js'></script>
Output: &lt;script src=&#x27;malicious.js&#x27;&gt;&lt;/script&gt;

Test 4: HTML Injection
Input:  <img src=x onerror='alert(1)'>
Output: &lt;img src=x onerror=&#x27;alert(1)&#x27;&gt;

Test 5: Event Handler
Input:  <div onload='alert(1)'>Test</div>
Output: &lt;div onload=&#x27;alert(1)&#x27;&gt;Test&lt;/div&gt;

Test 6: JavaScript URL
Input:  <a href='javascript:alert(1)'>Click</a>
Output: &lt;a href=&#x27;javascript:alert(1)&#x27;&gt;Click&lt;/a&gt;

Test 7: Special Characters
Input:  I love Breaking Bad & The Crown!
Output: I love Breaking Bad &amp; The Crown!

Test 8: Mixed Content
Input:  Great show! <script>alert('xss')</script> Highly recommended!
Output: Great show! &lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt; Highly recommended!

Test 9: Case Variation
Input:  <ScRiPt>alert('xss')</sCrIpT>
Output: &lt;ScRiPt&gt;alert(&#x27;xss&#x27;)&lt;/sCrIpT&gt;

Test 10: Nested Tags
Input:  <div><script>alert('xss')</script></div>
Output: &lt;div&gt;&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;&lt;/div&gt;
```

-   Protected fields: feedback, series title, episode title, user info

### RESTful API Design

```
GET    /api/series          # list all series
POST   /api/series          # create (Employee role required)
PUT    /api/series/:id      # update (Employee role required)
DELETE /api/series/:id      # delete (Admin role required)
```

## Extra Features

### Deployment - Docker container

```yaml
services:
    mysql: # Database
    redis: # Cache
    backend: # Flask API
    frontend: # React app
    nginx: # Reverse proxy
```

-   start system with `docker-compose up`, all services auto-linked and can be deployed separately

### 2. Redis Caching

```python
@cache_response(timeout=300)
def get_series_list():
    return WebSeries.query.all()
```

#### Core Content Routes (8)

| Route                       | Endpoint                       | Cache Duration | Key Prefix                |
| --------------------------- | ------------------------------ | -------------- | ------------------------- |
| **Series**                  | GET /api/series                | 5 min (300s)   | `series`                  |
| **Series Detail**           | GET /api/series/:id            | 10 min (600s)  | `series_detail`           |
| **Episode**                 | GET /api/episodes              | 5 min (300s)   | `episode`                 |
| **Episode Detail**          | GET /api/episodes/:id          | 10 min (600s)  | `episode_detail`          |
| **Feedback**                | GET /api/feedback              | 3 min (180s)   | `feedback`                |
| **Feedback Detail**         | GET /api/feedback/:id          | 5 min (300s)   | `feedback_detail`         |
| **Production House**        | GET /api/production-houses     | 10 min (600s)  | `production_house`        |
| **Production House Detail** | GET /api/production-houses/:id | 15 min (900s)  | `production_house_detail` |

#### Basic Data Routes (2)

| Route               | Endpoint               | Cache Duration | Key Prefix        |
| ------------------- | ---------------------- | -------------- | ----------------- |
| **Producer**        | GET /api/producers     | 10 min (600s)  | `producer`        |
| **Producer Detail** | GET /api/producers/:id | 10 min (600s)  | `producer_detail` |

#### Relations (5)

| Route                     | Endpoint                                 | Cache Duration | Key Prefix    |
| ------------------------- | ---------------------------------------- | -------------- | ------------- |
| **Producer Affiliations** | GET /api/relations/producer-affiliations | 10 min (600s)  | `affiliation` |
| **Telecasts**             | GET /api/relations/telecasts             | 5 min (300s)   | `telecast`    |
| **Contracts**             | GET /api/relations/contracts             | 10 min (600s)  | `contract`    |
| **Subtitle Languages**    | GET /api/relations/subtitle-languages    | 15 min (900s)  | `subtitle`    |
| **Releases**              | GET /api/relations/releases              | 15 min (900s)  | `release`     |

#### Admin Routes (2)

| Route           | Endpoint                 | Cache Duration | Key Prefix    |
| --------------- | ------------------------ | -------------- | ------------- |
| **Admin Stats** | GET /api/admin/stats     | 2 min (120s)   | `admin_stats` |
| **Countries**   | GET /api/admin/countries | 60 min (3600s) | `country`     |

**Actual Cache Results:**

-   Hit rate: 33% (4 hits / 12 requests)

### Current Redis Metrics

-   **Memory usage:** 1.12M / 512.00M (0.2% used) Sufficient
-   **Cache hit rate:** 33% (4/12) Early data; keep observing

**Configuration Notes:**

-   AOF persistence: `--appendonly yes` (no data loss)
-   Max memory: `512MB` (enough for medium traffic)
-   Eviction policy: `allkeys-lru` (optimal LRU strategy)
-   Health check: ping every 10 seconds

### 3. Database Indexing

Improve query performance for frequently accessed data patterns》

**7 Indexes Created:**

```sql
-- Composite Index: Search + Filter (used when filtering by title AND type)
CREATE INDEX idx_web_series_title_type ON web_series(title, type);
-- Use case: GET /api/series?search=Drama&type=Drama

-- Covering Index: Rating Aggregation (contains all columns needed for rating queries)
CREATE INDEX idx_feedback_series_rating ON feedback(webseries_id, rating);
-- Use case: SELECT AVG(rating) FROM feedback GROUP BY webseries_id

-- Full-Text Index: Text Search
CREATE FULLTEXT INDEX idx_web_series_title_fulltext ON web_series(title);
-- Use case: MATCH(title) AGAINST('Drama' IN NATURAL LANGUAGE MODE)

-- Active Contract Index: Status-based filtering
CREATE INDEX idx_contract_active ON series_contract(webseries_id, status);

-- Date Range Index: Telecast scheduling queries
CREATE INDEX idx_telecast_dates ON telecast(episode_id, start_date, end_date);

-- Affiliation Date Range: Finding current producers
CREATE INDEX idx_affiliation_dates ON producer_affiliation(house_id, start_date, end_date);
-- Foreign Key Optimization: JOIN performance
-- Auto-indexes on foreign key columns (webseries_id, episode_id, account_id)
```

**Actual Performance Test Results (Tested on real database):**

| Query Type                                 | Cost  | Rows Examined | Improvement       |
| ------------------------------------------ | ----- | ------------- | ----------------- |
| Filter by Type (WHERE type='Drama')        | 0.80  | 3 rows        | 56% faster        |
| Combined Search+Filter (type + title)      | 0.80  | 3 rows        | 45% faster        |
| Rating Aggregation (GROUP BY webseries_id) | 1.85  | 16 rows       | No sort needed    |
| Multi-table JOIN with GROUP BY             | 12.42 | ~97 rows      | Efficient nesting |
| Text Search (LIKE '%keyword%')             | 1.45  | 12 rows       | Full scan         |

**Test Environment:**

-   Database: 12 web_series, 78 episodes, 16 feedback records
-   Index Effectiveness: Type filter 56% faster than full table scan

### 4. History Tables

```sql

CREATE TABLE viewer_account_history (...)
CREATE TABLE web_series_history (...)
CREATE TABLE feedback_history (...)

CREATE TRIGGER trg_viewer_account_update ...
```

-   5 History tables: `viewer_account_history`, `web_series_history`, `feedback_history`, `episode_history`, `production_house_history`
-   keep track of all changes with timestamps and user IDs

---
