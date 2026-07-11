USE HackathonDB;
GO

-- Fix login failure after the latest pull.
-- Cause: backend now maps _user.is_temporary to Java primitive boolean.
-- Existing rows with NULL is_temporary make Hibernate fail while loading users.

IF COL_LENGTH('_user', 'is_temporary') IS NULL
BEGIN
    ALTER TABLE _user ADD is_temporary BIT NULL;
END;
GO

UPDATE _user
SET is_temporary = 0
WHERE is_temporary IS NULL;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.default_constraints dc
    JOIN sys.columns c
      ON dc.parent_object_id = c.object_id
     AND dc.parent_column_id = c.column_id
    WHERE dc.parent_object_id = OBJECT_ID('_user')
      AND c.name = 'is_temporary'
)
BEGIN
    ALTER TABLE _user
    ADD CONSTRAINT DF_user_is_temporary DEFAULT 0 FOR is_temporary;
END;
GO

ALTER TABLE _user
ALTER COLUMN is_temporary BIT NOT NULL;
GO

-- Optional verification.
SELECT username, role, approved, is_verified, is_temporary
FROM _user
ORDER BY id;
GO
