BEGIN;

-- Add constraint
ALTER TABLE "User"
    ADD CONSTRAINT check_birthNumber_lastVerificationIdentityCard
        CHECK (
            CASE
                WHEN "User"."birthNumber" IS NOT NULL THEN "User"."lastVerificationIdentityCard" IS NOT NULL
                ELSE FALSE
                END );

COMMIT;