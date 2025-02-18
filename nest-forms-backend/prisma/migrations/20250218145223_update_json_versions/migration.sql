-- These are the only existing versions
-- Update version 1.0 to 1.0.0
UPDATE "Forms"
SET "jsonVersion" = '1.0.0'
WHERE "jsonVersion" = '1.0';

-- Update version 1.1 to 1.1.0
UPDATE "Forms"
SET "jsonVersion" = '1.1.0'
WHERE "jsonVersion" = '1.1';