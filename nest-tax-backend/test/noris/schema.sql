-- Stub of the Noris (MSSQL) schema used by the e2e tests.
--
-- Only the objects and columns read by src/noris/utils/noris.queries.ts belong here. Views of the real Noris
-- database are modelled as plain tables, so tests can set their values directly.
--
-- Batches are separated by GO lines (see splitSqlBatches in test/e2e-global-setup.ts).

CREATE SCHEMA lcs
GO
