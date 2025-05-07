-- Add the new email record
INSERT INTO "Config" ("key", "value")
VALUES ('REPORTING_RECIPIENT_EMAIL', 'invalid@bratislava.sk');

-- Update REPORTING_SEND_EMAIL to REPORTING_GENERATE_REPORT
UPDATE "Config"
SET "key" = 'REPORTING_GENERATE_REPORT'
WHERE "key" = 'REPORTING_SEND_EMAIL';
