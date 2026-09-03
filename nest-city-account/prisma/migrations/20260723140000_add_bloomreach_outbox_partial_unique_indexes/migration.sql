-- Enforce at most one live "customers" command per account (matches the
-- @@unique([externalId], where: { commandName: "customers", status: "PENDING" })
-- declaration in schema.prisma).
CREATE UNIQUE INDEX "bloomreach_outbox_customers_pending_key"
    ON "BloomreachOutbox" ("externalId")
    WHERE "commandName" = 'customers' AND "status" = 'PENDING';

-- Enforce at most one live "customers/events" command per
-- (externalId, event_type, category). Not representable in schema.prisma:
-- Prisma's schema DSL has no syntax for expression-based index columns
-- (indexing commandData's JSON path values), with or without partialIndexes.
CREATE UNIQUE INDEX "bloomreach_outbox_events_pending_key"
    ON "BloomreachOutbox" ("externalId", ("commandData" ->> 'event_type'), ("commandData" -> 'properties' ->> 'category'))
    WHERE "commandName" = 'customers/events' AND "status" = 'PENDING';