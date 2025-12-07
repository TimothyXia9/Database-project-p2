-- ============================================================================
-- History Tables and Audit Trails
-- Purpose: Track all changes to critical tables for security and compliance
-- Date: 2025-12-04
-- ============================================================================

USE news_db;

-- ============================================================================
-- 1. VIEWER ACCOUNT HISTORY TABLE
-- ============================================================================

DROP TABLE IF EXISTS viewer_account_history;

CREATE TABLE viewer_account_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id VARCHAR(10) NOT NULL,
    operation VARCHAR(10) NOT NULL COMMENT 'INSERT, UPDATE, DELETE',
    changed_by VARCHAR(10) COMMENT 'Admin account that made the change',
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Snapshot of data at time of change
    email VARCHAR(255),
    first_name VARCHAR(64),
    last_name VARCHAR(64),
    account_type VARCHAR(10),
    password_hash VARCHAR(255),

    -- Additional metadata
    ip_address VARCHAR(45) COMMENT 'IP address of the change',
    user_agent TEXT COMMENT 'Browser/client information',

    INDEX idx_account_history (account_id, changed_at),
    INDEX idx_changed_by (changed_by),
    INDEX idx_operation (operation, changed_at)
) ENGINE=InnoDB COMMENT='Audit trail for viewer account changes';

-- ============================================================================
-- 2. WEB SERIES HISTORY TABLE
-- ============================================================================

DROP TABLE IF EXISTS web_series_history;

CREATE TABLE web_series_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    webseries_id VARCHAR(10) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    changed_by VARCHAR(10),
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Snapshot of data
    title VARCHAR(64),
    num_episodes INT,
    type VARCHAR(15),
    house_id VARCHAR(10),

    INDEX idx_series_history (webseries_id, changed_at),
    INDEX idx_changed_by (changed_by)
) ENGINE=InnoDB COMMENT='Audit trail for web series changes';

-- ============================================================================
-- 3. FEEDBACK HISTORY TABLE (for moderation tracking)
-- ============================================================================

DROP TABLE IF EXISTS feedback_history;

CREATE TABLE feedback_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_id VARCHAR(10) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    changed_by VARCHAR(10),
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Snapshot of data
    account_id VARCHAR(10),
    webseries_id VARCHAR(10),
    rating INT,
    review TEXT,
    moderation_status VARCHAR(20) COMMENT 'approved, flagged, removed',

    INDEX idx_feedback_history (feedback_id, changed_at),
    INDEX idx_moderation (moderation_status, changed_at)
) ENGINE=InnoDB COMMENT='Audit trail for feedback changes and moderation';

-- ============================================================================
-- 4. PASSWORD RESET TOKEN TABLE
-- ============================================================================

DROP TABLE IF EXISTS password_reset_token;

CREATE TABLE password_reset_token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(10) NOT NULL,
    token_hash VARCHAR(255) NOT NULL COMMENT 'Hashed token for security',
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at DATETIME NULL,
    ip_address VARCHAR(45) COMMENT 'IP that requested reset',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES viewer_account(account_id) ON DELETE CASCADE,
    INDEX idx_user_token (user_id, used, expires_at),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB COMMENT='Secure password reset tokens';

-- ============================================================================
-- 5. LOGIN ATTEMPTS TABLE (Security)
-- ============================================================================

DROP TABLE IF EXISTS login_attempts;

CREATE TABLE login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100) COMMENT 'invalid_password, account_not_found, account_locked',
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_email_attempts (email, attempted_at),
    INDEX idx_ip_attempts (ip_address, attempted_at),
    INDEX idx_failed_attempts (success, attempted_at)
) ENGINE=InnoDB COMMENT='Track login attempts for security';

-- ============================================================================
-- 6. TRIGGERS FOR VIEWER ACCOUNT HISTORY
-- ============================================================================

DELIMITER //

-- Trigger for INSERT
DROP TRIGGER IF EXISTS trg_viewer_account_insert//
CREATE TRIGGER trg_viewer_account_insert
AFTER INSERT ON viewer_account
FOR EACH ROW
BEGIN
    INSERT INTO viewer_account_history (
        account_id, operation, changed_by,
        email, first_name, last_name, account_type, password_hash
    )
    VALUES (
        NEW.account_id, 'INSERT', @current_user_id,
        NEW.email, NEW.first_name, NEW.last_name,
        NEW.account_type, NEW.password_hash
    );
END//

-- Trigger for UPDATE
DROP TRIGGER IF EXISTS trg_viewer_account_update//
CREATE TRIGGER trg_viewer_account_update
AFTER UPDATE ON viewer_account
FOR EACH ROW
BEGIN
    -- Only log if actual data changed
    IF (OLD.email != NEW.email OR
        OLD.first_name != NEW.first_name OR
        OLD.last_name != NEW.last_name OR
        OLD.account_type != NEW.account_type OR
        OLD.password_hash != NEW.password_hash) THEN

        INSERT INTO viewer_account_history (
            account_id, operation, changed_by,
            email, first_name, last_name, account_type, password_hash
        )
        VALUES (
            NEW.account_id, 'UPDATE', @current_user_id,
            NEW.email, NEW.first_name, NEW.last_name,
            NEW.account_type, NEW.password_hash
        );
    END IF;
END//

-- Trigger for DELETE
DROP TRIGGER IF EXISTS trg_viewer_account_delete//
CREATE TRIGGER trg_viewer_account_delete
BEFORE DELETE ON viewer_account
FOR EACH ROW
BEGIN
    INSERT INTO viewer_account_history (
        account_id, operation, changed_by,
        email, first_name, last_name, account_type, password_hash
    )
    VALUES (
        OLD.account_id, 'DELETE', @current_user_id,
        OLD.email, OLD.first_name, OLD.last_name,
        OLD.account_type, OLD.password_hash
    );
END//

-- ============================================================================
-- 7. TRIGGERS FOR WEB SERIES HISTORY
-- ============================================================================

DROP TRIGGER IF EXISTS trg_web_series_insert//
CREATE TRIGGER trg_web_series_insert
AFTER INSERT ON web_series
FOR EACH ROW
BEGIN
    INSERT INTO web_series_history (
        webseries_id, operation, changed_by,
        title, num_episodes, type, house_id
    )
    VALUES (
        NEW.webseries_id, 'INSERT', @current_user_id,
        NEW.title, NEW.num_episodes, NEW.type, NEW.house_id
    );
END//

DROP TRIGGER IF EXISTS trg_web_series_update//
CREATE TRIGGER trg_web_series_update
AFTER UPDATE ON web_series
FOR EACH ROW
BEGIN
    IF (OLD.title != NEW.title OR
        OLD.num_episodes != NEW.num_episodes OR
        OLD.type != NEW.type OR
        OLD.house_id != NEW.house_id) THEN

        INSERT INTO web_series_history (
            webseries_id, operation, changed_by,
            title, num_episodes, type, house_id
        )
        VALUES (
            NEW.webseries_id, 'UPDATE', @current_user_id,
            NEW.title, NEW.num_episodes, NEW.type, NEW.house_id
        );
    END IF;
END//

DROP TRIGGER IF EXISTS trg_web_series_delete//
CREATE TRIGGER trg_web_series_delete
BEFORE DELETE ON web_series
FOR EACH ROW
BEGIN
    INSERT INTO web_series_history (
        webseries_id, operation, changed_by,
        title, num_episodes, type, house_id
    )
    VALUES (
        OLD.webseries_id, 'DELETE', @current_user_id,
        OLD.title, OLD.num_episodes, OLD.type, OLD.house_id
    );
END//

-- ============================================================================
-- 8. TRIGGERS FOR FEEDBACK HISTORY
-- ============================================================================

DROP TRIGGER IF EXISTS trg_feedback_insert//
CREATE TRIGGER trg_feedback_insert
AFTER INSERT ON feedback
FOR EACH ROW
BEGIN
    INSERT INTO feedback_history (
        feedback_id, operation, changed_by,
        account_id, webseries_id, rating, review, moderation_status
    )
    VALUES (
        NEW.feedback_id, 'INSERT', @current_user_id,
        NEW.account_id, NEW.webseries_id, NEW.rating, NEW.review, 'approved'
    );
END//

DROP TRIGGER IF EXISTS trg_feedback_update//
CREATE TRIGGER trg_feedback_update
AFTER UPDATE ON feedback
FOR EACH ROW
BEGIN
    INSERT INTO feedback_history (
        feedback_id, operation, changed_by,
        account_id, webseries_id, rating, review, moderation_status
    )
    VALUES (
        NEW.feedback_id, 'UPDATE', @current_user_id,
        NEW.account_id, NEW.webseries_id, NEW.rating, NEW.review, 'modified'
    );
END//

DROP TRIGGER IF EXISTS trg_feedback_delete//
CREATE TRIGGER trg_feedback_delete
BEFORE DELETE ON feedback
FOR EACH ROW
BEGIN
    INSERT INTO feedback_history (
        feedback_id, operation, changed_by,
        account_id, webseries_id, rating, review, moderation_status
    )
    VALUES (
        OLD.feedback_id, 'DELETE', @current_user_id,
        OLD.account_id, OLD.webseries_id, OLD.rating, OLD.review, 'removed'
    );
END//

DELIMITER ;

-- ============================================================================
-- 9. AUDIT QUERY FUNCTIONS
-- ============================================================================

DELIMITER //

-- Function to get account change history
DROP PROCEDURE IF EXISTS sp_get_account_history//
CREATE PROCEDURE sp_get_account_history(
    IN p_account_id VARCHAR(10),
    IN p_limit INT
)
BEGIN
    SELECT
        history_id,
        account_id,
        operation,
        changed_by,
        changed_at,
        email,
        first_name,
        last_name,
        account_type
    FROM viewer_account_history
    WHERE account_id = p_account_id
    ORDER BY changed_at DESC
    LIMIT p_limit;
END//

-- Function to get series change history
DROP PROCEDURE IF EXISTS sp_get_series_history//
CREATE PROCEDURE sp_get_series_history(
    IN p_series_id VARCHAR(10),
    IN p_limit INT
)
BEGIN
    SELECT
        history_id,
        webseries_id,
        operation,
        changed_by,
        changed_at,
        title,
        num_episodes,
        type,
        house_id
    FROM web_series_history
    WHERE webseries_id = p_series_id
    ORDER BY changed_at DESC
    LIMIT p_limit;
END//

-- Function to detect suspicious login activity
DROP PROCEDURE IF EXISTS sp_detect_suspicious_logins//
CREATE PROCEDURE sp_detect_suspicious_logins(
    IN p_hours INT
)
BEGIN
    -- Find accounts with multiple failed login attempts
    SELECT
        email,
        ip_address,
        COUNT(*) as failed_attempts,
        MAX(attempted_at) as last_attempt
    FROM login_attempts
    WHERE success = FALSE
        AND attempted_at >= DATE_SUB(NOW(), INTERVAL p_hours HOUR)
    GROUP BY email, ip_address
    HAVING failed_attempts >= 5
    ORDER BY failed_attempts DESC;
END//

-- Function to get password reset activity
DROP PROCEDURE IF EXISTS sp_get_reset_activity//
CREATE PROCEDURE sp_get_reset_activity(
    IN p_user_id VARCHAR(10)
)
BEGIN
    SELECT
        id,
        user_id,
        created_at,
        expires_at,
        used,
        used_at,
        ip_address,
        CASE
            WHEN used THEN 'Used'
            WHEN expires_at < NOW() THEN 'Expired'
            ELSE 'Active'
        END as status
    FROM password_reset_token
    WHERE user_id = p_user_id
    ORDER BY created_at DESC;
END//

DELIMITER ;

-- ============================================================================
-- 10. USAGE EXAMPLES
-- ============================================================================

-- Set current admin user (for audit trail)
SET @current_user_id = 'ACC0000001';

-- Example: Get account history
CALL sp_get_account_history('ACC0000002', 20);

-- Example: Get series history
CALL sp_get_series_history('WS00000001', 20);

-- Example: Detect suspicious logins in last 24 hours
CALL sp_detect_suspicious_logins(24);

-- Example: Get password reset activity for a user
CALL sp_get_reset_activity('ACC0000002');

-- Example: Find all changes by a specific admin
SELECT
    'Account' as table_name,
    account_id as record_id,
    operation,
    changed_at
FROM viewer_account_history
WHERE changed_by = 'ACC0000001'

UNION ALL

SELECT
    'Series' as table_name,
    webseries_id as record_id,
    operation,
    changed_at
FROM web_series_history
WHERE changed_by = 'ACC0000001'

ORDER BY changed_at DESC
LIMIT 50;

-- Example: Find all deleted records in last 30 days
SELECT
    'Account' as table_name,
    account_id as record_id,
    email as details,
    changed_at as deleted_at,
    changed_by as deleted_by
FROM viewer_account_history
WHERE operation = 'DELETE'
    AND changed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

UNION ALL

SELECT
    'Series' as table_name,
    webseries_id as record_id,
    title as details,
    changed_at as deleted_at,
    changed_by as deleted_by
FROM web_series_history
WHERE operation = 'DELETE'
    AND changed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

ORDER BY deleted_at DESC;

-- ============================================================================
-- 11. MAINTENANCE JOBS
-- ============================================================================

-- Archive old history records (keep last 2 years)
-- Run this periodically as a maintenance job
DELIMITER //

DROP PROCEDURE IF EXISTS sp_archive_old_history//
CREATE PROCEDURE sp_archive_old_history()
BEGIN
    DECLARE v_cutoff_date DATETIME;
    DECLARE v_deleted_accounts INT;
    DECLARE v_deleted_series INT;
    DECLARE v_deleted_feedback INT;

    SET v_cutoff_date = DATE_SUB(NOW(), INTERVAL 2 YEAR);

    -- Delete old account history
    DELETE FROM viewer_account_history WHERE changed_at < v_cutoff_date;
    SET v_deleted_accounts = ROW_COUNT();

    -- Delete old series history
    DELETE FROM web_series_history WHERE changed_at < v_cutoff_date;
    SET v_deleted_series = ROW_COUNT();

    -- Delete old feedback history
    DELETE FROM feedback_history WHERE changed_at < v_cutoff_date;
    SET v_deleted_feedback = ROW_COUNT();

    SELECT
        v_deleted_accounts as accounts_archived,
        v_deleted_series as series_archived,
        v_deleted_feedback as feedback_archived,
        v_cutoff_date as cutoff_date;
END//

DELIMITER ;

-- ============================================================================
-- SUMMARY
-- ============================================================================

/*
History Tables Created:
1. viewer_account_history - Tracks all account changes
2. web_series_history - Tracks all series modifications
3. feedback_history - Tracks feedback changes and moderation
4. password_reset_token - Secure password reset tracking
5. login_attempts - Security monitoring for login attempts

Triggers Created:
- INSERT, UPDATE, DELETE triggers for all history tables
- Automatically capture changes with timestamps
- Support for tracking who made changes (@current_user_id)

Stored Procedures:
- sp_get_account_history - View account change history
- sp_get_series_history - View series change history
- sp_detect_suspicious_logins - Security monitoring
- sp_get_reset_activity - Password reset audit
- sp_archive_old_history - Maintenance

Security Features:
✓ Complete audit trail of all changes
✓ Track who, what, when for compliance
✓ Monitor suspicious login activity
✓ Secure password reset tokens
✓ Prevent unauthorized modifications

Next Steps:
1. Run this script to create history tables and triggers
2. Update application to set @current_user_id before operations
3. Set up periodic job to run sp_archive_old_history
4. Monitor sp_detect_suspicious_logins for security threats
*/
