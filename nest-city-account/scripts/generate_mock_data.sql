-- ============================================================================
-- TEST DATA GENERATION SCRIPT FOR PRISMA DATABASE
-- ============================================================================
ABORT;
BEGIN;

-- ============================================================================
-- MODULE 1: CLEANUP (Optional - uncomment to clear existing test data)
-- ============================================================================

TRUNCATE TABLE "UserGdprData" CASCADE;
TRUNCATE TABLE "LegalPersonGdprData" CASCADE;
TRUNCATE TABLE "UserIdCardVerify" CASCADE;
TRUNCATE TABLE "LegalPersonIcoIdCardVerify" CASCADE;
TRUNCATE TABLE "UpvsIdentityByUri" CASCADE;
TRUNCATE TABLE "PhysicalEntity" CASCADE;
TRUNCATE TABLE "User" CASCADE;
TRUNCATE TABLE "LegalPerson" CASCADE;
TRUNCATE TABLE "Config" CASCADE;

-- ============================================================================
-- MODULE 2: CONFIGURATION DATA
-- ============================================================================

INSERT INTO "Config" (id, "createdAt", "updatedAt", key, value)
VALUES (gen_random_uuid(), NOW(), NOW(), 'tax_season_lock_date', '"2024-04-01"'::json),
       (gen_random_uuid(), NOW(), NOW(), 'verification_retry_limit', '3'::json),
       (gen_random_uuid(), NOW(), NOW(), 'edesk_update_interval', '86400'::json),
       (gen_random_uuid(), NOW(), NOW(), 'gdpr_retention_period', '2555'::json),
       (gen_random_uuid(), NOW(), NOW(), 'system_maintenance_mode', 'false'::json);

-- ============================================================================
-- MODULE 3: USER DATA
-- ============================================================================

-- Create Users with different verification tiers
INSERT INTO "User" (id, "createdAt", "updatedAt", "externalId", email, ifo, "birthNumber",
                    "lastVerificationIdentityCard", "oldMagproxyDatabase", "requeuedInVerification",
                    "userAttribute", "lastTaxYear", "taxDeliveryMethod", "taxDeliveryMethodAtLockDate",
                    "taxDeliveryMethodCityAccountDate", "taxDeliveryMethodCityAccountLockDate", "cognitoTier",
                    "isDeceased")
VALUES
-- Verified users
(gen_random_uuid(),
 NOW() - INTERVAL '30 days',
 NOW(),
 'ext-001',
 'john.doe@example.com',
 'RC123456',
 '9001010001',
 NOW() - INTERVAL '10 days',
 0,
 0,
 'verified_user',
 2023,
 'CITY_ACCOUNT',
 'CITY_ACCOUNT',
 NOW() - INTERVAL '15 days',
 NOW() - INTERVAL '15 days',
 'IDENTITY_CARD',
 false),
(gen_random_uuid(),
 NOW() - INTERVAL '25 days',
 NOW(),
 'ext-002',
 'jane.smith@example.com',
 'RC123457',
 '8552020002',
 NOW() - INTERVAL '5 days',
 0,
 0,
 'verified_user',
 2023,
 'POSTAL',
 'POSTAL',
 NULL,
 NULL,
 'EID',
 false),
(gen_random_uuid(),
 NOW() - INTERVAL '20 days',
 NOW(),
 'ext-003',
 'peter.novak@example.com',
 'RC123458',
 '7703030003',
 NOW() - INTERVAL '15 days',
 0,
 0,
 'verified_user',
 2022,
 'CITY_ACCOUNT',
 'EDESK',
 NOW() - INTERVAL '20 days',
 NULL,
 'IDENTITY_CARD',
 false),

-- Users in verification queue
(gen_random_uuid(),
 NOW() - INTERVAL '15 days',
 NOW(),
 'ext-004',
 'maria.horvath@example.com',
 'RC123459',
 '9504040004',
 NULL,
 0,
 1,
 'queue_user',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'QUEUE_IDENTITY_CARD',
 false),
(gen_random_uuid(),
 NOW() - INTERVAL '10 days',
 NOW(),
 'ext-005',
 'tomas.kral@example.com',
 'RC123460',
 '8205050005',
 NULL,
 0,
 2,
 'queue_user',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'NOT_VERIFIED_IDENTITY_CARD',
 false),

-- New users
(gen_random_uuid(),
 NOW() - INTERVAL '5 days',
 NOW(),
 'ext-006',
 'lucia.svoboda@example.com',
 NULL,
 NULL,
 NULL,
 0,
 0,
 'new_user',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'NEW',
 false),
(gen_random_uuid(),
 NOW() - INTERVAL '2 days',
 NOW(),
 'ext-007',
 'martin.cech@example.com',
 NULL,
 NULL,
 NULL,
 0,
 0,
 'new_user',
 NULL,
 NULL,
 NULL,
 NULL,
 NULL,
 'NEW',
 false),

-- Deceased user
(gen_random_uuid(),
 NOW() - INTERVAL '100 days',
 NOW(),
 'ext-008',
 'deceased.user@example.com',
 'RC123461',
 '5401010001',
 NOW() - INTERVAL '90 days',
 0,
 0,
 'deceased_user',
 2021,
 'POSTAL',
 'POSTAL',
 NULL,
 NULL,
 'IDENTITY_CARD',
 true);

-- ============================================================================
-- MODULE 4: PHYSICAL ENTITY DATA
-- ============================================================================

-- Create Physical Entities (some linked to users, some standalone)
WITH user_ids AS (SELECT id, "externalId"
                  FROM "User"
                  WHERE "externalId" IN ('ext-001', 'ext-002', 'ext-003', 'ext-004'))
INSERT
INTO "PhysicalEntity" (id, "createdAt", "updatedAt", "userId", uri, ifo, "birthNumber",
                       "activeEdesk", "activeEdeskUpdatedAt", "activeEdeskUpdateFailCount")
VALUES
-- Linked to users
((SELECT id FROM user_ids WHERE "externalId" = 'ext-001'), NOW() - INTERVAL '25 days', NOW(),
 (SELECT id FROM user_ids WHERE "externalId" = 'ext-001'), 'rc://sk/123456', 'RC123456', '9001010001', true,
 NOW() - INTERVAL '1 day', 0),
((SELECT id FROM user_ids WHERE "externalId" = 'ext-002'), NOW() - INTERVAL '20 days', NOW(),
 (SELECT id FROM user_ids WHERE "externalId" = 'ext-002'), 'rc://sk/123457', 'RC123457', '8552020002', true,
 NOW() - INTERVAL '2 days', 0),
((SELECT id FROM user_ids WHERE "externalId" = 'ext-003'), NOW() - INTERVAL '15 days', NOW(),
 (SELECT id FROM user_ids WHERE "externalId" = 'ext-003'), 'rc://sk/123458', 'RC123458', '7703030003', false,
 NOW() - INTERVAL '10 days', 3),
((SELECT id FROM user_ids WHERE "externalId" = 'ext-004'), NOW() - INTERVAL '10 days', NOW(),
 (SELECT id FROM user_ids WHERE "externalId" = 'ext-004'), 'rc://sk/123459', 'RC123459', '9504040004', true,
 NOW() - INTERVAL '1 day', 0),

-- Standalone physical entities
(gen_random_uuid(), NOW() - INTERVAL '30 days', NOW(), NULL, 'rc://sk/999001', 'RC999001', '8801010101', true,
 NOW() - INTERVAL '3 days', 0),
(gen_random_uuid(), NOW() - INTERVAL '25 days', NOW(), NULL, 'rc://sk/999002', 'RC999002', '7702020202', false,
 NOW() - INTERVAL '15 days', 5);

-- ============================================================================
-- MODULE 5: LEGAL PERSON DATA
-- ============================================================================

INSERT INTO "LegalPerson" (id, "createdAt", "updatedAt", "externalId", email, ico, "birthNumber",
                           "lastVerificationAttempt", "userAttribute", "cognitoTier")
VALUES (gen_random_uuid(), NOW() - INTERVAL '40 days', NOW(), 'legal-001', 'info@company1.sk', '12345678', '8001010001',
        NOW() - INTERVAL '5 days', 'legal_verified', 'IDENTITY_CARD'),
       (gen_random_uuid(), NOW() - INTERVAL '35 days', NOW(), 'legal-002', 'contact@company2.sk', '87654321',
        '7502020002', NOW() - INTERVAL '10 days', 'legal_verified', 'EID'),
       (gen_random_uuid(), NOW() - INTERVAL '20 days', NOW(), 'legal-003', 'admin@startup.sk', '11223344', '9003030003',
        NOW() - INTERVAL '2 days', 'legal_queue', 'QUEUE_IDENTITY_CARD'),
       (gen_random_uuid(), NOW() - INTERVAL '15 days', NOW(), 'legal-004', 'office@business.sk', '44332211',
        '8504040004', NULL, 'legal_new', 'NEW'),
       (gen_random_uuid(), NOW() - INTERVAL '10 days', NOW(), 'legal-005', 'hello@enterprise.sk', '55667788',
        '7705050005', NOW() - INTERVAL '1 day', 'legal_failed', 'NOT_VERIFIED_IDENTITY_CARD');

-- ============================================================================
-- MODULE 6: VERIFICATION DATA
-- ============================================================================

-- User ID Card Verification attempts
WITH user_data AS (SELECT id, "birthNumber" FROM "User" WHERE "birthNumber" IS NOT NULL LIMIT 3)
INSERT
INTO "UserIdCardVerify" (id, "userId", "birthNumber", "idCard", "verifyStart")
SELECT gen_random_uuid(),
       id,
       "birthNumber",
       'ID' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0'),
       NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30)
FROM user_data;

-- Legal Person Verification attempts
WITH legal_data AS (SELECT id, "birthNumber", ico
                    FROM "LegalPerson"
                    WHERE "birthNumber" IS NOT NULL
                      AND ico IS NOT NULL
                    LIMIT 3)
INSERT
INTO "LegalPersonIcoIdCardVerify" (id, "legalPersonId", "birthNumber", "idCard", ico, "verifyStart")
SELECT gen_random_uuid(),
       id,
       "birthNumber",
       'ID' || LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0'),
       ico,
       NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30)
FROM legal_data;

-- ============================================================================
-- MODULE 7: UPVS IDENTITY DATA
-- ============================================================================

WITH physical_entities AS (SELECT id, uri
                           FROM "PhysicalEntity"
                           WHERE uri IS NOT NULL
                           LIMIT 4)
INSERT
INTO "UpvsIdentityByUri" (id, "createdAt", "updatedAt", uri, data, "physicalEntityId")
SELECT gen_random_uuid(),
       NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30),
       NOW(),
       uri,
       jsonb_build_object(
               'firstName', CASE FLOOR(RANDOM() * 4)
                                WHEN 0 THEN 'Ján'
                                WHEN 1 THEN 'Mária'
                                WHEN 2 THEN 'Peter'
                                ELSE 'Anna'
           END,
               'lastName', CASE FLOOR(RANDOM() * 4)
                               WHEN 0 THEN 'Novák'
                               WHEN 1 THEN 'Svoboda'
                               WHEN 2 THEN 'Horváth'
                               ELSE 'Kráľ'
                   END,
               'address', jsonb_build_object(
                       'street', 'Testovacia ulica ' || FLOOR(RANDOM() * 100 + 1)::text,
                       'city', CASE FLOOR(RANDOM() * 3)
                                   WHEN 0 THEN 'Bratislava'
                                   WHEN 1 THEN 'Košice'
                                   ELSE 'Žilina'
                           END,
                       'zipCode', LPAD(FLOOR(RANDOM() * 100000)::text, 5, '0')
                          ),
               'lastUpdated', to_char(NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 10), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
       ),
       id
FROM physical_entities;

-- ============================================================================
-- MODULE 8: GDPR DATA
-- ============================================================================

-- User GDPR consents
WITH user_sample AS (SELECT id
                     FROM "User"
                     LIMIT 6),
     gdpr_combinations AS (SELECT u.id as user_id,
                                  gdpr_type,
                                  gdpr_category,
                                  gdpr_subtype
                           FROM user_sample u
                                    CROSS JOIN (VALUES ('ANALYTICS', 'CITY', 'subscribe'),
                                                       ('DATAPROCESSING', 'ESBS', NULL),
                                                       ('FORMAL_COMMUNICATION', 'TAXES', 'subscribe'),
                                                       ('MARKETING', 'CITY', 'subscribe'),
                                                       ('MARKETING', 'CITY', 'unsubscribe'),
                                                       ('ANALYTICS', 'LIBRARY',
                                                        'subscribe')) AS gdpr_data(gdpr_type, gdpr_category, gdpr_subtype))
INSERT
INTO "UserGdprData" (id, "createdAt", "updatedAt", "userId", type, category, "subType")
SELECT gen_random_uuid(),
       NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 60),
       NOW(),
       user_id,
       gdpr_type::"GDPRTypeEnum",
       gdpr_category::"GDPRCategoryEnum",
       CASE WHEN gdpr_subtype IS NOT NULL THEN gdpr_subtype::"GDPRSubTypeEnum" ELSE NULL END
FROM gdpr_combinations
WHERE RANDOM() > 0.3;
-- Randomly include ~70% of combinations

-- Legal Person GDPR consents
WITH legal_sample AS (SELECT id
                      FROM "LegalPerson"
                      LIMIT 4),
     legal_gdpr_combinations AS (SELECT lp.id as legal_person_id,
                                        gdpr_type,
                                        gdpr_category,
                                        gdpr_subtype
                                 FROM legal_sample lp
                                          CROSS JOIN (VALUES ('DATAPROCESSING', 'ESBS', NULL),
                                                             ('FORMAL_COMMUNICATION', 'TAXES', 'subscribe'),
                                                             ('ANALYTICS', 'CITY', 'subscribe'),
                                                             ('MARKETING', 'SWIMMINGPOOLS',
                                                              'subscribe')) AS gdpr_data(gdpr_type, gdpr_category, gdpr_subtype))
INSERT
INTO "LegalPersonGdprData" (id, "createdAt", "updatedAt", "legalPersonId", type, category, "subType")
SELECT gen_random_uuid(),
       NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 60),
       NOW(),
       legal_person_id,
       gdpr_type::"GDPRTypeEnum",
       gdpr_category::"GDPRCategoryEnum",
       CASE WHEN gdpr_subtype IS NOT NULL THEN gdpr_subtype::"GDPRSubTypeEnum" ELSE NULL END
FROM legal_gdpr_combinations
WHERE RANDOM() > 0.4;
-- Randomly include ~60% of combinations

-- ============================================================================
-- MODULE 9: DATA VERIFICATION QUERIES (Optional)
-- ============================================================================

-- Uncomment to verify the inserted data:

-- SELECT 'Users' as entity, COUNT(*) as count FROM "User"
-- UNION ALL
-- SELECT 'PhysicalEntity' as entity, COUNT(*) as count FROM "PhysicalEntity"
-- UNION ALL
-- SELECT 'LegalPerson' as entity, COUNT(*) as count FROM "LegalPerson"
-- UNION ALL
-- SELECT 'UserGdprData' as entity, COUNT(*) as count FROM "UserGdprData"
-- UNION ALL
-- SELECT 'LegalPersonGdprData' as entity, COUNT(*) as count FROM "LegalPersonGdprData"
-- UNION ALL
-- SELECT 'UserIdCardVerify' as entity, COUNT(*) as count FROM "UserIdCardVerify"
-- UNION ALL
-- SELECT 'LegalPersonIcoIdCardVerify' as entity, COUNT(*) as count FROM "LegalPersonIcoIdCardVerify"
-- UNION ALL
-- SELECT 'UpvsIdentityByUri' as entity, COUNT(*) as count FROM "UpvsIdentityByUri"
-- UNION ALL
-- SELECT 'Config' as entity, COUNT(*) as count FROM "Config";

-- Sample queries to test relationships:
-- SELECT u.email, pe."activeEdesk", COUNT(ugd.id) as gdpr_records
-- FROM "User" u
-- LEFT JOIN "PhysicalEntity" pe ON u.id = pe."userId"
-- LEFT JOIN "UserGdprData" ugd ON u.id = ugd."userId"
-- WHERE u.email IS NOT NULL
-- GROUP BY u.id, u.email, pe."activeEdesk";

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
COMMIT;