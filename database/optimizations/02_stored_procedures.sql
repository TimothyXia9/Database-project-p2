-- ============================================================================
-- Stored Procedures for Security and Data Integrity
-- Purpose: Implement secure data operations with validation
-- Date: 2025-12-04
-- ============================================================================

USE news_db;

DELIMITER //

-- ============================================================================
-- 1. CREATE WEB SERIES WITH VALIDATION
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_create_web_series//

CREATE PROCEDURE sp_create_web_series(
    IN p_title VARCHAR(64),
    IN p_type VARCHAR(15),
    IN p_house_id VARCHAR(10),
    OUT p_series_id VARCHAR(10),
    OUT p_error_msg VARCHAR(255)
)
BEGIN
    DECLARE v_house_exists INT;
    DECLARE v_valid_types VARCHAR(100) DEFAULT 'Drama,Comedy,Action,Thriller,Sci-Fi,Romance,Horror,Mystery';

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_error_msg = 'Database error occurred during series creation';
        SET p_series_id = NULL;
    END;

    START TRANSACTION;

    -- Validate inputs
    IF p_title IS NULL OR TRIM(p_title) = '' THEN
        SET p_error_msg = 'Title cannot be empty';
        SET p_series_id = NULL;
        ROLLBACK;
    ELSEIF p_type IS NULL OR FIND_IN_SET(p_type, v_valid_types) = 0 THEN
        SET p_error_msg = CONCAT('Invalid type. Must be one of: ', v_valid_types);
        SET p_series_id = NULL;
        ROLLBACK;
    ELSE
        -- Validate production house exists
        SELECT COUNT(*) INTO v_house_exists
        FROM production_house
        WHERE house_id = p_house_id;

        IF v_house_exists = 0 THEN
            SET p_error_msg = 'Production house does not exist';
            SET p_series_id = NULL;
            ROLLBACK;
        ELSE
            -- Generate unique series ID
            SET p_series_id = CONCAT('WS', LPAD(FLOOR(RAND() * 100000000), 8, '0'));

            -- Ensure uniqueness
            WHILE EXISTS(SELECT 1 FROM web_series WHERE webseries_id = p_series_id) DO
                SET p_series_id = CONCAT('WS', LPAD(FLOOR(RAND() * 100000000), 8, '0'));
            END WHILE;

            -- Insert series
            INSERT INTO web_series (webseries_id, title, num_episodes, type, house_id, created_at, updated_at)
            VALUES (p_series_id, p_title, 0, p_type, p_house_id, NOW(), NOW());

            SET p_error_msg = NULL;
            COMMIT;
        END IF;
    END IF;
END//

-- ============================================================================
-- 2. SUBMIT FEEDBACK WITH DUPLICATE CHECK
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_submit_feedback//

CREATE PROCEDURE sp_submit_feedback(
    IN p_account_id VARCHAR(10),
    IN p_series_id VARCHAR(10),
    IN p_rating INT,
    IN p_review TEXT,
    OUT p_feedback_id VARCHAR(10),
    OUT p_error_msg VARCHAR(255)
)
BEGIN
    DECLARE v_existing_feedback INT;
    DECLARE v_series_exists INT;
    DECLARE v_account_exists INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_error_msg = 'Database error occurred during feedback submission';
        SET p_feedback_id = NULL;
    END;

    START TRANSACTION;

    -- Validate rating range
    IF p_rating < 1 OR p_rating > 5 THEN
        SET p_error_msg = 'Rating must be between 1 and 5';
        SET p_feedback_id = NULL;
        ROLLBACK;
    ELSE
        -- Validate series exists
        SELECT COUNT(*) INTO v_series_exists
        FROM web_series
        WHERE webseries_id = p_series_id;

        IF v_series_exists = 0 THEN
            SET p_error_msg = 'Web series does not exist';
            SET p_feedback_id = NULL;
            ROLLBACK;
        ELSE
            -- Validate account exists
            SELECT COUNT(*) INTO v_account_exists
            FROM viewer_account
            WHERE account_id = p_account_id;

            IF v_account_exists = 0 THEN
                SET p_error_msg = 'Account does not exist';
                SET p_feedback_id = NULL;
                ROLLBACK;
            ELSE
                -- Check for existing feedback from same user
                SELECT COUNT(*) INTO v_existing_feedback
                FROM feedback
                WHERE account_id = p_account_id AND webseries_id = p_series_id;

                IF v_existing_feedback > 0 THEN
                    SET p_error_msg = 'You have already submitted feedback for this series';
                    SET p_feedback_id = NULL;
                    ROLLBACK;
                ELSE
                    -- Generate unique feedback ID
                    SET p_feedback_id = CONCAT('FB', LPAD(FLOOR(RAND() * 100000000), 8, '0'));

                    WHILE EXISTS(SELECT 1 FROM feedback WHERE feedback_id = p_feedback_id) DO
                        SET p_feedback_id = CONCAT('FB', LPAD(FLOOR(RAND() * 100000000), 8, '0'));
                    END WHILE;

                    -- Insert feedback
                    INSERT INTO feedback (feedback_id, account_id, webseries_id, rating, review, created_at)
                    VALUES (p_feedback_id, p_account_id, p_series_id, p_rating, p_review, NOW());

                    SET p_error_msg = NULL;
                    COMMIT;
                END IF;
            END IF;
        END IF;
    END IF;
END//

-- ============================================================================
-- 3. CREATE EPISODE WITH VALIDATION
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_create_episode//

CREATE PROCEDURE sp_create_episode(
    IN p_series_id VARCHAR(10),
    IN p_episode_number VARCHAR(10),
    IN p_title VARCHAR(64),
    IN p_duration_minutes INT,
    IN p_release_date DATE,
    OUT p_episode_id VARCHAR(10),
    OUT p_error_msg VARCHAR(255)
)
BEGIN
    DECLARE v_series_exists INT;
    DECLARE v_duplicate_episode INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_error_msg = 'Database error occurred during episode creation';
        SET p_episode_id = NULL;
    END;

    START TRANSACTION;

    -- Validate series exists
    SELECT COUNT(*) INTO v_series_exists
    FROM web_series
    WHERE webseries_id = p_series_id;

    IF v_series_exists = 0 THEN
        SET p_error_msg = 'Web series does not exist';
        SET p_episode_id = NULL;
        ROLLBACK;
    ELSE
        -- Check for duplicate episode number
        SELECT COUNT(*) INTO v_duplicate_episode
        FROM episode
        WHERE webseries_id = p_series_id AND episode_number = p_episode_number;

        IF v_duplicate_episode > 0 THEN
            SET p_error_msg = 'Episode number already exists for this series';
            SET p_episode_id = NULL;
            ROLLBACK;
        ELSE
            -- Generate unique episode ID
            SET p_episode_id = CONCAT('EP', LPAD(FLOOR(RAND() * 100000000), 8, '0'));

            WHILE EXISTS(SELECT 1 FROM episode WHERE episode_id = p_episode_id) DO
                SET p_episode_id = CONCAT('EP', LPAD(FLOOR(RAND() * 100000000), 8, '0'));
            END WHILE;

            -- Insert episode
            INSERT INTO episode (
                episode_id, episode_number, title, webseries_id,
                duration_minutes, release_date, created_at, updated_at
            )
            VALUES (
                p_episode_id, p_episode_number, p_title, p_series_id,
                p_duration_minutes, p_release_date, NOW(), NOW()
            );

            SET p_error_msg = NULL;
            COMMIT;
        END IF;
    END IF;
END//

-- ============================================================================
-- 4. GET SERIES STATISTICS
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_get_series_stats//

CREATE PROCEDURE sp_get_series_stats(
    IN p_series_id VARCHAR(10)
)
BEGIN
    SELECT
        ws.webseries_id,
        ws.title,
        ws.type,
        COUNT(DISTINCT e.episode_id) as total_episodes,
        COUNT(DISTINCT f.feedback_id) as total_reviews,
        COALESCE(AVG(f.rating), 0) as avg_rating,
        COUNT(DISTINCT sc.contract_id) as total_contracts,
        COUNT(DISTINCT wsr.country_code) as release_countries
    FROM web_series ws
    LEFT JOIN episode e ON ws.webseries_id = e.webseries_id
    LEFT JOIN feedback f ON ws.webseries_id = f.webseries_id
    LEFT JOIN series_contract sc ON ws.webseries_id = sc.webseries_id
    LEFT JOIN web_series_release wsr ON ws.webseries_id = wsr.webseries_id
    WHERE ws.webseries_id = p_series_id
    GROUP BY ws.webseries_id, ws.title, ws.type;
END//

-- ============================================================================
-- 5. GET TOP RATED SERIES
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_get_top_rated_series//

CREATE PROCEDURE sp_get_top_rated_series(
    IN p_min_reviews INT,
    IN p_limit INT
)
BEGIN
    SELECT
        ws.webseries_id,
        ws.title,
        ws.type,
        COUNT(f.feedback_id) as review_count,
        AVG(f.rating) as avg_rating
    FROM web_series ws
    INNER JOIN feedback f ON ws.webseries_id = f.webseries_id
    GROUP BY ws.webseries_id, ws.title, ws.type
    HAVING COUNT(f.feedback_id) >= p_min_reviews
    ORDER BY avg_rating DESC, review_count DESC
    LIMIT p_limit;
END//

-- ============================================================================
-- 6. CLEANUP OLD RESET TOKENS
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_cleanup_expired_tokens//

CREATE PROCEDURE sp_cleanup_expired_tokens()
BEGIN
    DECLARE v_deleted_count INT;

    DELETE FROM password_reset_token
    WHERE expires_at < NOW() OR used = TRUE;

    SET v_deleted_count = ROW_COUNT();

    SELECT CONCAT('Cleaned up ', v_deleted_count, ' expired/used tokens') as message;
END//

-- ============================================================================
-- 7. GET USER ACTIVITY SUMMARY
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_get_user_activity//

CREATE PROCEDURE sp_get_user_activity(
    IN p_account_id VARCHAR(10)
)
BEGIN
    SELECT
        va.account_id,
        va.email,
        va.first_name,
        va.last_name,
        va.account_type,
        COUNT(DISTINCT f.feedback_id) as total_reviews,
        AVG(f.rating) as avg_rating_given,
        va.created_at as member_since
    FROM viewer_account va
    LEFT JOIN feedback f ON va.account_id = f.account_id
    WHERE va.account_id = p_account_id
    GROUP BY
        va.account_id, va.email, va.first_name,
        va.last_name, va.account_type, va.created_at;
END//

DELIMITER ;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Example 1: Create a new series
CALL sp_create_web_series(
    'Breaking Bad Season 1',
    'Drama',
    'PH00000001',
    @series_id,
    @error
);
SELECT @series_id as series_id, @error as error_message;

-- Example 2: Submit feedback
CALL sp_submit_feedback(
    'ACC0000001',
    @series_id,
    5,
    'Excellent series!',
    @feedback_id,
    @error
);
SELECT @feedback_id as feedback_id, @error as error_message;

-- Example 3: Create an episode
CALL sp_create_episode(
    @series_id,
    'E01',
    'Pilot',
    47,
    '2025-01-01',
    @episode_id,
    @error
);
SELECT @episode_id as episode_id, @error as error_message;

-- Example 4: Get series statistics
CALL sp_get_series_stats(@series_id);

-- Example 5: Get top rated series (minimum 5 reviews, top 10)
CALL sp_get_top_rated_series(5, 10);

-- Example 6: Cleanup expired tokens
CALL sp_cleanup_expired_tokens();

-- Example 7: Get user activity
CALL sp_get_user_activity('ACC0000001');

-- ============================================================================
-- GRANT PERMISSIONS (if needed)
-- ============================================================================

-- Grant execute permissions to application user
-- GRANT EXECUTE ON PROCEDURE news_db.sp_create_web_series TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE news_db.sp_submit_feedback TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE news_db.sp_create_episode TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE news_db.sp_get_series_stats TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE news_db.sp_get_top_rated_series TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE news_db.sp_get_user_activity TO 'app_user'@'%';
-- GRANT EXECUTE ON PROCEDURE news_db.sp_cleanup_expired_tokens TO 'app_user'@'%';
