-- Read-only preflight for migration 20261124120000_split_legal_person_account (#1801).
-- Run against the database BEFORE `prisma migrate deploy`:
--
--   psql "$DATABASE_URL" -f prisma/preflight_20261124120000_split_legal_person_account.sql
--
-- Everything runs inside a READ ONLY transaction that is rolled back; nothing is modified.
-- Each check prints: check | status | detail
--   FAIL  -> the migration will abort or produce wrong data; fix before migrating
--   WARN  -> migration succeeds, but look at the data
--   INFO  -> numbers to sanity-check what the migration will do

\set ON_ERROR_STOP on
\pset pager off
BEGIN TRANSACTION READ ONLY;

-- ---------------------------------------------------------------------------------------------
-- A. Environment / schema state the migration relies on
-- ---------------------------------------------------------------------------------------------
\echo '== A. Environment and schema state =='

SELECT 'A1 postgres >= 13 (gen_random_uuid built in)' AS check,
       CASE WHEN current_setting('server_version_num')::int >= 130000 THEN 'PASS' ELSE 'FAIL' END AS status,
       current_setting('server_version') AS detail
UNION ALL
SELECT 'A2 migration not applied yet',
       CASE WHEN NOT EXISTS (SELECT 1 FROM "_prisma_migrations"
                             WHERE migration_name = '20261124120000_split_legal_person_account')
            THEN 'PASS' ELSE 'FAIL' END,
       'row in _prisma_migrations'
UNION ALL
SELECT 'A3 all previous migrations applied and finished',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       coalesce(string_agg(migration_name, ', '), '')
FROM "_prisma_migrations"
WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL
UNION ALL
SELECT 'A4 table "LegalPerson" exists with legacy columns',
       CASE WHEN count(*) = 4 THEN 'PASS' ELSE 'FAIL' END,
       count(*) || '/4 of externalId, email, ico, birthNumber'
FROM information_schema.columns
WHERE table_schema = current_schema() AND table_name = 'LegalPerson'
  AND column_name IN ('externalId', 'email', 'ico', 'birthNumber')
UNION ALL
SELECT 'A5 target tables do not exist yet',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       coalesce(string_agg(table_name, ', '), '')
FROM information_schema.tables
WHERE table_schema = current_schema()
  AND table_name IN ('LegalPersonAccount', 'LegalPersonRepresentation', '_rep_birth_number')
UNION ALL
SELECT 'A6 target enums do not exist yet',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       coalesce(string_agg(typname, ', '), '')
FROM pg_type
WHERE typname IN ('LegalPersonKindEnum', 'LegalPersonRepresentationTypeEnum')
UNION ALL
SELECT 'A7 new PhysicalEntity columns do not exist yet',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       coalesce(string_agg(column_name, ', '), '')
FROM information_schema.columns
WHERE table_schema = current_schema() AND table_name = 'PhysicalEntity'
  AND column_name IN ('upvsIdentityId', 'upvsName');

-- Every constraint / index the migration renames or drops must exist under exactly this name.
WITH expected(kind, name) AS (
    VALUES ('constraint', 'LegalPerson_pkey'),
           ('constraint', 'LegalPersonConsents_legalPersonId_fkey'),
           ('constraint', 'LegalPersonConsentsHistory_legalPersonId_fkey'),
           ('constraint', 'LegalPersonGdprData_legalPersonId_fkey'),
           ('constraint', 'LegalPersonLoginClient_legalPersonId_fkey'),
           ('index', 'LegalPerson_email_key'),
           ('index', 'LegalPerson_externalId_key'),
           ('index', 'LegalPerson_ico_birthNumber_key'),
           ('index', 'LegalPersonConsents_legalPersonId_consentType_key'),
           ('index', 'LegalPersonConsentsHistory_legalPersonId_idx'),
           ('index', 'LegalPersonLoginClient_legalPersonId_idx'),
           ('index', 'LegalPersonLoginClient_legalPersonId_loginClient_key'))
SELECT 'A8 renamed constraints/indexes exist' AS check,
       CASE WHEN count(*) FILTER (WHERE NOT found) = 0 THEN 'PASS' ELSE 'FAIL' END AS status,
       coalesce('missing: ' || string_agg(name, ', ') FILTER (WHERE NOT found), 'all 12 present') AS detail
FROM (SELECT e.name,
             CASE e.kind
                 WHEN 'constraint' THEN EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conname = e.name)
                 ELSE EXISTS (SELECT 1 FROM pg_indexes i
                              WHERE i.schemaname = current_schema() AND i.indexname = e.name)
                 END AS found
      FROM expected e) x
UNION ALL
-- Target names must be free.
SELECT 'A9 target constraint/index names are free',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       coalesce(string_agg(relname, ', '), '')
FROM pg_class
WHERE relname LIKE 'LegalPersonAccount%'
   OR relname LIKE 'LegalPersonRepresentation%'
   OR relname LIKE '%legalPersonAccountId%'
   OR relname IN ('LegalPerson_ico_key', 'LegalPerson_upvsIdentityId_key',
                  'PhysicalEntity_upvsIdentityId_key')
UNION ALL
SELECT 'A10 consents history trigger function exists (gets replaced)',
       CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'legal_person_consents_to_history')
            THEN 'PASS' ELSE 'FAIL' END,
       'legal_person_consents_to_history()'
UNION ALL
SELECT 'A11 no other functions reference LegalPerson."legalPersonId"',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'WARN' END,
       coalesce(string_agg(proname, ', '), '')
FROM pg_proc
WHERE prosrc LIKE '%legalPersonId%'
  AND proname <> 'legal_person_consents_to_history'
UNION ALL
SELECT 'A12 no views depend on renamed tables/columns',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'WARN' END,
       coalesce(string_agg(DISTINCT v.table_name, ', '), '')
FROM information_schema.view_column_usage v
WHERE v.table_name IN ('LegalPerson', 'LegalPersonConsents', 'LegalPersonConsentsHistory',
                       'LegalPersonGdprData', 'LegalPersonLoginClient');

-- ---------------------------------------------------------------------------------------------
-- B. The migration's own pre-flight guards (these RAISE in the migration)
-- ---------------------------------------------------------------------------------------------
\echo '== B. Migration pre-flight guards =='

SELECT 'B1 no numeric ico with BA-rodne-cislo birthNumber' AS check,
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status,
       count(*) || ' rows; ids: ' || coalesce(string_agg(id::text, ', '), '') AS detail
FROM "LegalPerson"
WHERE ico ~ '^[0-9]+(_[0-9]+)?$' AND "birthNumber" LIKE 'BA-rodne-cislo-%'
UNION ALL
SELECT 'B2 no birthNumber without ico',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       count(*) || ' rows; ids: ' || coalesce(string_agg(id::text, ', '), '')
FROM "LegalPerson"
WHERE ico IS NULL AND "birthNumber" IS NOT NULL
UNION ALL
SELECT 'B3 no two accounts per (ico, birth number ignoring slash) (new unique key)',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       count(*) || ' pairs'
FROM (SELECT 1 FROM "LegalPerson"
      WHERE ico ~ '^[0-9]+(_[0-9]+)?$' AND "birthNumber" IS NOT NULL
      GROUP BY ico, replace("birthNumber", '/', '') HAVING count(*) > 1) d;

-- ---------------------------------------------------------------------------------------------
-- C. Classification: what becomes PO vs DEPARTMENT
--    (non-numeric ico => DEPARTMENT; anything malformed here would be misclassified)
-- ---------------------------------------------------------------------------------------------
\echo '== C. Classification =='

SELECT 'C1 distinct department codes (verify every one is a real department)' AS check,
       'INFO' AS status,
       coalesce(string_agg(ico || ' (' || n || ' accounts)', ', ' ORDER BY ico), 'none') AS detail
FROM (SELECT ico, count(*) n FROM "LegalPerson"
      WHERE ico IS NOT NULL AND ico !~ '^[0-9]+(_[0-9]+)?$' GROUP BY ico) d
UNION ALL
-- Looks like a mistyped real IČO (digits plus whitespace/letters/dashes) -> would become DEPARTMENT
SELECT 'C2 non-numeric icos that look like real IČO (would wrongly become DEPARTMENT)',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       coalesce(string_agg(DISTINCT ico, ', '), '')
FROM "LegalPerson"
WHERE ico IS NOT NULL
  AND ico !~ '^[0-9]+(_[0-9]+)?$'
  AND regexp_replace(ico, '[^0-9]', '', 'g') ~ '^[0-9]{6,}$'
UNION ALL
SELECT 'C3 department accounts with a real-looking birthNumber (DROPPED by the migration)',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'WARN' END,
       count(*) || ' rows; ids: ' || coalesce(string_agg(id::text, ', '), '')
FROM "LegalPerson"
WHERE ico !~ '^[0-9]+(_[0-9]+)?$'
  AND "birthNumber" IS NOT NULL
  AND "birthNumber" NOT LIKE 'BA-rodne-cislo-%'
UNION ALL
SELECT 'C4 PO icos with org-unit suffix (_NNN), kept as separate companies',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'INFO' END,
       count(DISTINCT ico) || ' distinct'
FROM "LegalPerson"
WHERE ico ~ '^[0-9]+_[0-9]+$'
UNION ALL
SELECT 'C5 PO icos not 8 digits (unusual IČO length)',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'WARN' END,
       count(DISTINCT ico) || ' distinct: ' || coalesce(string_agg(DISTINCT ico, ', '), '')
FROM "LegalPerson"
WHERE ico ~ '^[0-9]+$' AND length(ico) <> 8;

-- ---------------------------------------------------------------------------------------------
-- D. Representatives (PhysicalEntity reuse / creation)
-- ---------------------------------------------------------------------------------------------
\echo '== D. Representatives =='

WITH rep AS (SELECT DISTINCT replace("birthNumber", '/', '') AS normalized
             FROM "LegalPerson"
             WHERE ico ~ '^[0-9]+(_[0-9]+)?$' AND "birthNumber" IS NOT NULL),
     pe_match AS (SELECT r.normalized, count(pe.id) AS n, count(pe."userId") AS with_user
                  FROM rep r
                           LEFT JOIN "PhysicalEntity" pe ON replace(pe."birthNumber", '/', '') = r.normalized
                  GROUP BY r.normalized)
SELECT 'D1 distinct representatives (by normalized birth number)' AS check, 'INFO' AS status,
       count(*)::text AS detail
FROM pe_match
UNION ALL
SELECT 'D2 representatives reusing an existing PhysicalEntity', 'INFO', count(*)::text
FROM pe_match WHERE n >= 1
UNION ALL
SELECT 'D3   ... of which linked to a User (konateľ also has FO account)', 'INFO', count(*)::text
FROM pe_match WHERE with_user >= 1
UNION ALL
SELECT 'D4 new PhysicalEntity rows to be created (without User)', 'INFO', count(*)::text
FROM pe_match WHERE n = 0
UNION ALL
SELECT 'D5 representatives matching MULTIPLE PhysicalEntity rows (migration picks User-linked, then oldest)',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'WARN' END, count(*)::text
FROM pe_match WHERE n > 1
UNION ALL
SELECT 'D6 representatives matching multiple User-linked PhysicalEntities (ambiguous person)',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'WARN' END, count(*)::text
FROM pe_match WHERE with_user > 1;

SELECT 'D7 PO birth numbers not 9-10 digits (after removing slash)' AS check,
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'WARN' END AS status,
       count(*) || ' accounts; ids: ' || coalesce(string_agg(id::text, ', '), '') AS detail
FROM "LegalPerson"
WHERE ico ~ '^[0-9]+(_[0-9]+)?$'
  AND "birthNumber" IS NOT NULL
  AND replace("birthNumber", '/', '') !~ '^[0-9]{9,10}$'
UNION ALL
SELECT 'D8 same person stored with and without slash across accounts (merged into one)',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'INFO' END, count(*)::text
FROM (SELECT replace("birthNumber", '/', '') FROM "LegalPerson"
      WHERE ico ~ '^[0-9]+(_[0-9]+)?$' AND "birthNumber" IS NOT NULL
      GROUP BY 1 HAVING count(DISTINCT "birthNumber") > 1) x
UNION ALL
SELECT 'D9 PO accounts with ico but no birthNumber (linked to company without representative)',
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'INFO' END, count(*)::text
FROM "LegalPerson"
WHERE ico ~ '^[0-9]+(_[0-9]+)?$' AND "birthNumber" IS NULL;

-- ---------------------------------------------------------------------------------------------
-- E. Expected outcome (compare with the database after migrating)
-- ---------------------------------------------------------------------------------------------
\echo '== E. Expected outcome =='

SELECT 'E1 LegalPersonAccount rows (= current LegalPerson rows)' AS check, 'INFO' AS status,
       count(*)::text AS detail
FROM "LegalPerson"
UNION ALL
SELECT 'E2   ... unverified (no ico, stay unlinked)', 'INFO', count(*)::text
FROM "LegalPerson" WHERE ico IS NULL
UNION ALL
SELECT 'E3 new LegalPerson companies: PO', 'INFO', count(DISTINCT ico)::text
FROM "LegalPerson" WHERE ico ~ '^[0-9]+(_[0-9]+)?$'
UNION ALL
SELECT 'E4 new LegalPerson companies: DEPARTMENT', 'INFO', count(DISTINCT ico)::text
FROM "LegalPerson" WHERE ico IS NOT NULL AND ico !~ '^[0-9]+(_[0-9]+)?$'
UNION ALL
SELECT 'E5 LegalPersonRepresentation rows (distinct person x company)', 'INFO', count(*)::text
FROM (SELECT DISTINCT replace("birthNumber", '/', ''), ico FROM "LegalPerson"
      WHERE ico ~ '^[0-9]+(_[0-9]+)?$' AND "birthNumber" IS NOT NULL) x
UNION ALL
SELECT 'E6 companies with more than one representative (several konatelia)', 'INFO', count(*)::text
FROM (SELECT ico FROM "LegalPerson"
      WHERE ico ~ '^[0-9]+(_[0-9]+)?$' AND "birthNumber" IS NOT NULL
      GROUP BY ico HAVING count(DISTINCT replace("birthNumber", '/', '')) > 1) x
UNION ALL
SELECT 'E7 persons representing more than one company', 'INFO', count(*)::text
FROM (SELECT replace("birthNumber", '/', '') FROM "LegalPerson"
      WHERE ico ~ '^[0-9]+(_[0-9]+)?$' AND "birthNumber" IS NOT NULL
      GROUP BY 1 HAVING count(DISTINCT ico) > 1) x
UNION ALL
SELECT 'E8 child rows whose FK column gets renamed',
       'INFO',
       (SELECT count(*) FROM "LegalPersonConsents") || ' consents, '
           || (SELECT count(*) FROM "LegalPersonConsentsHistory") || ' history, '
           || (SELECT count(*) FROM "LegalPersonGdprData") || ' gdpr, '
           || (SELECT count(*) FROM "LegalPersonLoginClient") || ' login clients';

-- ---------------------------------------------------------------------------------------------
-- F. Locking: the migration takes ACCESS EXCLUSIVE locks on these tables
-- ---------------------------------------------------------------------------------------------
\echo '== F. Locks / activity =='

SELECT 'F1 open sessions touching affected tables right now' AS check,
       CASE WHEN count(*) = 0 THEN 'PASS' ELSE 'WARN' END AS status,
       count(*) || ' locks held by other backends' AS detail
FROM pg_locks l
         JOIN pg_class c ON c.oid = l.relation
WHERE l.pid <> pg_backend_pid()
  AND c.relname IN ('LegalPerson', 'LegalPersonConsents', 'LegalPersonConsentsHistory',
                    'LegalPersonGdprData', 'LegalPersonLoginClient', 'PhysicalEntity')
UNION ALL
SELECT 'F2 PhysicalEntity size (ALTER ADD COLUMN + unique index build)', 'INFO',
       (SELECT count(*) FROM "PhysicalEntity") || ' rows, '
           || pg_size_pretty(pg_total_relation_size('"PhysicalEntity"'));

ROLLBACK;
