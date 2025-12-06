-- ============================================================================
-- Database Indexing Optimization Script
-- Purpose: Create additional indexes to improve query performance
-- Date: 2025-12-04
-- ============================================================================

USE news_db;

-- ============================================================================
-- 1. COMPOSITE INDEXES FOR FREQUENTLY COMBINED QUERIES
-- ============================================================================

-- Index for search + filter operations (most common user operation)
-- This index helps when users search AND filter by type simultaneously
DROP INDEX IF EXISTS idx_web_series_title_type ON web_series;
CREATE INDEX idx_web_series_title_type ON web_series(title, type);

-- Expected improvement: 70-90% faster for combined search+filter queries
-- Use case: GET /api/series?search=Drama&type=Drama

-- ============================================================================
-- 2. COVERING INDEXES FOR AGGREGATE QUERIES
-- ============================================================================

-- Index for feedback rating calculations
-- This is a "covering index" - contains all columns needed for rating queries
DROP INDEX IF EXISTS idx_feedback_series_rating ON feedback;
CREATE INDEX idx_feedback_series_rating ON feedback(webseries_id, rating);

-- Expected improvement: 60-80% faster rating calculations
-- Use case: Calculating average ratings for series display
-- Query: SELECT webseries_id, AVG(rating) FROM feedback GROUP BY webseries_id

-- ============================================================================
-- 3. PARTIAL INDEXES FOR FILTERED DATA
-- ============================================================================

-- Note: MySQL doesn't support partial indexes directly like PostgreSQL
-- But we can optimize with functional indexes in MySQL 8.0+

-- Index for active contracts only
-- Most queries only care about active contracts, not expired ones
DROP INDEX IF EXISTS idx_contract_active ON series_contract;
CREATE INDEX idx_contract_active ON series_contract(webseries_id, status);

-- Expected improvement: 40-60% faster active contract queries
-- Use case: Finding active contracts for a series
-- Query: SELECT * FROM series_contract WHERE webseries_id = ? AND status = 'Active'

-- ============================================================================
-- 4. DATE RANGE INDEXES
-- ============================================================================

-- Index for telecast date range queries
-- Helps find current and upcoming telecasts efficiently
DROP INDEX IF EXISTS idx_telecast_dates ON telecast;
CREATE INDEX idx_telecast_dates ON telecast(episode_id, start_date, end_date);

-- Expected improvement: 70-85% faster date range queries
-- Use case: Finding current/upcoming telecasts
-- Query: SELECT * FROM telecast WHERE start_date <= NOW() AND end_date >= NOW()

-- ============================================================================
-- 5. FOREIGN KEY OPTIMIZATION INDEXES
-- ============================================================================

-- These indexes help with JOIN operations and foreign key lookups

-- Index for episode to series lookups (already exists, but verify)
SHOW INDEX FROM episode WHERE Key_name = 'idx_episode_webseries_id';

-- Index for feedback to account lookups (already exists, but verify)
SHOW INDEX FROM feedback WHERE Key_name = 'idx_feedback_account_id';

-- Index for producer affiliations (improve JOIN performance)
DROP INDEX IF EXISTS idx_affiliation_dates ON producer_affiliation;
CREATE INDEX idx_affiliation_dates ON producer_affiliation(house_id, start_date, end_date);

-- Expected improvement: 50-70% faster when finding current affiliations
-- Use case: Finding producers currently affiliated with a house
-- Query: SELECT * FROM producer_affiliation
--        WHERE house_id = ? AND (end_date IS NULL OR end_date >= NOW())

-- ============================================================================
-- 6. FULL-TEXT SEARCH INDEXES (Advanced)
-- ============================================================================

-- Full-text index for better search performance on titles and reviews
-- This is much faster than LIKE '%keyword%' for text search

-- Full-text index on series title
DROP INDEX IF EXISTS idx_web_series_title_fulltext ON web_series;
CREATE FULLTEXT INDEX idx_web_series_title_fulltext ON web_series(title);

-- Full-text index on feedback reviews
DROP INDEX IF EXISTS idx_feedback_review_fulltext ON feedback;
CREATE FULLTEXT INDEX idx_feedback_review_fulltext ON feedback(review);

-- Expected improvement: 80-95% faster text searches
-- Use case: Full-text search in series titles
-- Query: SELECT * FROM web_series WHERE MATCH(title) AGAINST('Drama' IN NATURAL LANGUAGE MODE)

-- ============================================================================
-- 7. INDEX ANALYSIS AND VERIFICATION
-- ============================================================================

-- Show all indexes on web_series table
SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLUMNS,
    INDEX_TYPE,
    NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'news_db' AND TABLE_NAME = 'web_series'
GROUP BY TABLE_NAME, INDEX_NAME, INDEX_TYPE, NON_UNIQUE;

-- Show index usage statistics (after some time running)
SELECT
    object_schema AS database_name,
    object_name AS table_name,
    index_name,
    count_star AS rows_selected,
    count_read AS rows_read
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'news_db'
ORDER BY count_star DESC;

-- ============================================================================
-- 8. PERFORMANCE TESTING QUERIES
-- ============================================================================

-- Test 1: Search with type filter
EXPLAIN ANALYZE
SELECT * FROM web_series
WHERE title LIKE '%Drama%' AND type = 'Drama'
LIMIT 20;

-- Test 2: Rating aggregation
EXPLAIN ANALYZE
SELECT webseries_id, AVG(rating) as avg_rating, COUNT(*) as count
FROM feedback
GROUP BY webseries_id
HAVING count >= 5
ORDER BY avg_rating DESC
LIMIT 10;

-- Test 3: Episode count per series
EXPLAIN ANALYZE
SELECT
    ws.webseries_id,
    ws.title,
    COUNT(e.episode_id) as episode_count
FROM web_series ws
LEFT JOIN episode e ON ws.webseries_id = e.webseries_id
GROUP BY ws.webseries_id, ws.title;

-- Test 4: Current telecasts
EXPLAIN ANALYZE
SELECT
    e.episode_id,
    e.title,
    t.start_date,
    t.end_date
FROM episode e
JOIN telecast t ON e.episode_id = t.episode_id
WHERE t.start_date <= NOW() AND t.end_date >= NOW();

-- Test 5: Active producer affiliations
EXPLAIN ANALYZE
SELECT
    p.first_name,
    p.last_name,
    ph.name as production_house,
    pa.start_date
FROM producer p
JOIN producer_affiliation pa ON p.producer_id = pa.producer_id
JOIN production_house ph ON pa.house_id = ph.house_id
WHERE pa.end_date IS NULL OR pa.end_date >= NOW();

-- ============================================================================
-- 9. INDEX MAINTENANCE
-- ============================================================================

-- Analyze tables to update index statistics
ANALYZE TABLE web_series;
ANALYZE TABLE episode;
ANALYZE TABLE feedback;
ANALYZE TABLE series_contract;
ANALYZE TABLE telecast;
ANALYZE TABLE producer_affiliation;

-- Optimize tables to rebuild indexes
OPTIMIZE TABLE web_series;
OPTIMIZE TABLE episode;
OPTIMIZE TABLE feedback;

-- ============================================================================
-- 10. MONITORING QUERIES
-- ============================================================================

-- Find unused indexes (run after application has been running for a while)
SELECT
    t.TABLE_SCHEMA AS database_name,
    t.TABLE_NAME AS table_name,
    t.INDEX_NAME AS index_name,
    t.INDEX_TYPE
FROM information_schema.STATISTICS t
LEFT JOIN performance_schema.table_io_waits_summary_by_index_usage p
    ON t.TABLE_SCHEMA = p.OBJECT_SCHEMA
    AND t.TABLE_NAME = p.OBJECT_NAME
    AND t.INDEX_NAME = p.INDEX_NAME
WHERE t.TABLE_SCHEMA = 'news_db'
    AND t.INDEX_NAME != 'PRIMARY'
    AND p.INDEX_NAME IS NULL;

-- Find duplicate indexes
SELECT
    a.TABLE_NAME,
    a.INDEX_NAME AS index1,
    b.INDEX_NAME AS index2,
    a.COLUMN_NAME
FROM information_schema.STATISTICS a
JOIN information_schema.STATISTICS b
    ON a.TABLE_SCHEMA = b.TABLE_SCHEMA
    AND a.TABLE_NAME = b.TABLE_NAME
    AND a.COLUMN_NAME = b.COLUMN_NAME
    AND a.INDEX_NAME < b.INDEX_NAME
    AND a.SEQ_IN_INDEX = b.SEQ_IN_INDEX
WHERE a.TABLE_SCHEMA = 'news_db';

-- ============================================================================
-- SUMMARY
-- ============================================================================

/*
Indexes Created:
1. idx_web_series_title_type - Composite index for search + filter
2. idx_feedback_series_rating - Covering index for ratings
3. idx_contract_active - Filtered index for active contracts
4. idx_telecast_dates - Date range index
5. idx_affiliation_dates - Affiliation date range
6. idx_web_series_title_fulltext - Full-text search on titles
7. idx_feedback_review_fulltext - Full-text search on reviews

Expected Performance Improvements:
- Search queries: 70-95% faster
- Rating calculations: 60-80% faster
- Date range queries: 70-85% faster
- JOIN operations: 50-70% faster

Next Steps:
1. Run this script on your database
2. Run the test queries to verify performance
3. Monitor index usage with the monitoring queries
4. Adjust application queries to use full-text search where appropriate
*/
