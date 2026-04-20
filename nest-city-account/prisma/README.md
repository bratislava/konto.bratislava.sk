<!-- TOC -->
* [Prisma / Database notes (nest-city-account)](#prisma-database-notes-nest-city-account)
  * [DB-managed: `PhysicalEntity.edeskStatusChangedAt`](#db-managed-physicalentityedeskstatuschangedat)
    * [Purpose](#purpose)
    * [Guarantees](#guarantees)
    * [Where it is implemented](#where-it-is-implemented)
    * [How to use in the app code](#how-to-use-in-the-app-code)
<!-- TOC -->

# Prisma / Database notes (nest-city-account)

This folder contains:

- `schema.prisma` – Prisma schema used to generate the client
- `migrations/` – SQL migrations applied to the Postgres database

This README documents **database-managed behavior** that is not obvious from application code alone.

---

## DB-managed: `PhysicalEntity.edeskStatusChangedAt`

### Purpose

`PhysicalEntity.edeskStatusChangedAt` is a timestamp that represents **when the eDesk status last actually changed**.

We need a reliable signal for “real change of eDesk state” because:

- eDesk status can be refreshed periodically (e.g., every few days)
- downstream logic (e.g., notification/email sending) depends on the *moment of change*
- updates may happen from multiple paths (app code, scripts, manual admin updates)

By managing this in the database, we get stronger guarantees than doing comparisons in Prisma/app code.

### Guarantees

The database enforces the following rules:

1. **Updates only when `activeEdesk` truly changes.**  
   “Real change” means the new value is distinct from the old value (NULL-safe comparison).  
   This avoids false updates that would otherwise shift timestamps and break time-based logic.

2. **Read-only from the application's perspective.**   
   Direct/manual updates to `edeskStatusChangedAt` are ignored/overwritten by the database.

3. **Applies to all update paths.**  
   The rules apply whether the row is updated by:
    - Prisma in the application
    - ad-hoc SQL updates
    - scripts / backfills / maintenance jobs

### Where it is implemented

The behavior is implemented using Postgres trigger functions and triggers created in a Prisma migration under:
[create_edesk_changed_at_status_with_trigger](migrations/20260206141517_create_edesk_changed_at_status_with_trigger/migration.sql)

### How to use in the app code

- Update `activeEdesk` as usual.
- Treat `edeskStatusChangedAt` as **DB-managed** (read-only).
- Do not use `updatedAt` as a proxy for eDesk status change time (it changes for unrelated updates).

