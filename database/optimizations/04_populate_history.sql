-- ============================================================================
-- Populate History Tables with Existing Data
-- Purpose: Add existing records to history tables as initial INSERT records
-- Date: 2025-12-08
-- ============================================================================

USE news_db;

-- ============================================================================
-- 1. POPULATE VIEWER_ACCOUNT_HISTORY
-- ============================================================================

INSERT INTO viewer_account_history (
    account_id,
    operation,
    changed_by,
    changed_at,
    email,
    first_name,
    last_name,
    account_type,
    password_hash
)
SELECT
    account_id,
    'INSERT' as operation,
    NULL as changed_by,  -- Original creation, no admin tracked
    created_at as changed_at,
    email,
    first_name,
    last_name,
    account_type,
    password_hash
FROM viewer_account
WHERE account_id NOT IN (
    SELECT DISTINCT account_id
    FROM viewer_account_history
);

-- ============================================================================
-- 2. POPULATE WEB_SERIES_HISTORY
-- ============================================================================

INSERT INTO web_series_history (
    webseries_id,
    operation,
    changed_by,
    changed_at,
    title,
    num_episodes,
    type,
    house_id
)
SELECT
    webseries_id,
    'INSERT' as operation,
    NULL as changed_by,
    created_at as changed_at,
    title,
    num_episodes,
    type,
    house_id
FROM web_series
WHERE webseries_id NOT IN (
    SELECT DISTINCT webseries_id
    FROM web_series_history
);

-- ============================================================================
-- 3. POPULATE FEEDBACK_HISTORY
-- ============================================================================

INSERT INTO feedback_history (
    feedback_id,
    operation,
    changed_by,
    changed_at,
    account_id,
    webseries_id,
    rating,
    feedback_text,
    moderation_status
)
SELECT
    feedback_id,
    'INSERT' as operation,
    NULL as changed_by,
    created_at as changed_at,
    account_id,
    webseries_id,
    rating,
    feedback_text,
    'approved' as moderation_status
FROM feedback
WHERE feedback_id NOT IN (
    SELECT DISTINCT feedback_id
    FROM feedback_history
);

-- ============================================================================
-- 4. VERIFY RESULTS
-- ============================================================================

SELECT
    'viewer_account_history' as table_name,
    COUNT(*) as record_count
FROM viewer_account_history

UNION ALL

SELECT
    'web_series_history' as table_name,
    COUNT(*) as record_count
FROM web_series_history

UNION ALL

SELECT
    'feedback_history' as table_name,
    COUNT(*) as record_count
FROM feedback_history;

-- ============================================================================
-- SUMMARY
-- ============================================================================

/*
This script populates history tables with existing data:

1. All existing viewer accounts -> viewer_account_history
2. All existing web series -> web_series_history
3. All existing feedback -> feedback_history

All records are marked with operation='INSERT' and use the original
created_at timestamp as changed_at to preserve chronological order.

The changed_by field is NULL for these initial records since they
existed before the audit system was implemented.

Future changes will be automatically tracked by the triggers.
*/
