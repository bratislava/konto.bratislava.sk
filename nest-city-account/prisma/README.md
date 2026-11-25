<!-- TOC -->
* [Prisma / Database notes (nest-city-account)](#prisma-database-notes-nest-city-account)
  * [DB-managed: `PhysicalEntity.edeskStatusChangedAt`](#db-managed-physicalentityedeskstatuschangedat)
    * [Purpose](#purpose)
    * [Guarantees](#guarantees)
    * [Where it is implemented](#where-it-is-implemented)
    * [How to use in the app code](#how-to-use-in-the-app-code)
  * [Legal persons: company, representatives, accounts](#legal-persons-company-representatives-accounts)
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


---

## Legal persons: company, representatives, accounts

Introduced in [split_legal_person_account](migrations/20261124120000_split_legal_person_account/migration.sql).

| Table                       | Meaning                                                                                              |
|:----------------------------|:-----------------------------------------------------------------------------------------------------|
| `LegalPerson`               | The company, keyed by unique `ico` and (once known) UPVS `upvsIdentityId`. `kind`: PO, FO_P, DEPARTMENT. |
| `PhysicalEntity`            | Also holds representatives (konatelia / FO-P owners), usually **without** a `User`.                  |
| `LegalPersonRepresentation` | N:N person - company, with `type`, `validFrom` / `validTo` and `lastVerifiedAt`.                      |
| `LegalPersonAccount`        | A Cognito login of type `po` / `fo-p` (formerly the `LegalPerson` table, minus `ico` / `birthNumber`). |

### Guarantees (hidden from Prisma)

- `LegalPerson`: a DEPARTMENT has no `upvsIdentityId`, and its `ico` is non-numeric. Every other kind
  has a numeric `ico` (optionally `_suffix`). A department code therefore never equals a real IČO
  (forms-backend grants form access by IČO equality).
- `LegalPersonRepresentation`: PO allows only `STATUTORY_BODY`, FO_P only `OWNER`, and a DEPARTMENT has no
  representations. This is a **deferred** constraint trigger checked at commit, so `kind` and the
  representation types can be switched in one transaction.
- `LegalPersonAccount`:
  - has no `ico` / `birthNumber` of its own; the API reads them from `legalPerson.ico` and
    `physicalEntity.birthNumber` (`withLegalPersonAccountIdentifiers`).
  - unique (`legalPersonId`, `physicalEntityId`): one account per company and representative.
    Department accounts have no representative (NULL), so any number of them can share a department.
  - `physicalEntityId` requires `legalPersonId`, and (`physicalEntityId`, `legalPersonId`) must be an
    existing representation. So a department account can never have a representative.

### How to use in the app code

Write the account ↔ company link only through `LegalPersonService`
(`linkVerifiedAccount`, `unlinkAccount`, `syncKindFromAccountType`).
