# Redis Cache Usage

#### Core Content Routes (8)

| Route                       | Endpoint                       | Cache Duration | Key Prefix                |
| --------------------------- | ------------------------------ | -------------- | ------------------------- |
| **Series**                  | GET /api/series                | 5 Min (300s)   | `series`                  |
| **Series Detail**           | GET /api/series/:id            | 10 Min (600s)  | `series_detail`           |
| **Episode**                 | GET /api/episodes              | 5 Min (300s)   | `episode`                 |
| **Episode Detail**          | GET /api/episodes/:id          | 10 Min (600s)  | `episode_detail`          |
| **Feedback**                | GET /api/feedback              | 3 Min (180s)   | `feedback`                |
| **Feedback Detail**         | GET /api/feedback/:id          | 5 Min (300s)   | `feedback_detail`         |
| **Production House**        | GET /api/production-houses     | 10 Min (600s)  | `production_house`        |
| **Production House Detail** | GET /api/production-houses/:id | 15 Min (900s)  | `production_house_detail` |

#### Basic Data Routes (2)

| Route               | Endpoint               | Cache Duration | Key Prefix        |
| ------------------- | ---------------------- | -------------- | ----------------- |
| **Producer**        | GET /api/producers     | 10 Min (600s)  | `producer`        |
| **Producer Detail** | GET /api/producers/:id | 10 Min (600s)  | `producer_detail` |

#### Relations (5)

| Route                     | Endpoint                                 | Cache Duration | Key Prefix    |
| ------------------------- | ---------------------------------------- | -------------- | ------------- |
| **Producer Affiliations** | GET /api/relations/producer-affiliations | 10 Min (600s)  | `affiliation` |
| **Telecasts**             | GET /api/relations/telecasts             | 5 Min (300s)   | `telecast`    |
| **Contracts**             | GET /api/relations/contracts             | 10 Min (600s)  | `contract`    |
| **Subtitle Languages**    | GET /api/relations/subtitle-languages    | 15 Min (900s)  | `subtitle`    |
| **Releases**              | GET /api/relations/releases              | 15 Min (900s)  | `release`     |

#### Admin Routes (2)

| Route           | Endpoint                 | Cache Duration | Key Prefix    |
| --------------- | ------------------------ | -------------- | ------------- |
| **Admin Stats** | GET /api/admin/stats     | 2 Min (120s)   | `admin_stats` |
| **Countries**   | GET /api/admin/countries | 60 Min (3600s) | `country`     |

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
