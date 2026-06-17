# UPVS multi-tier priority work scheduler

`UpvsQueueService` resolves and refreshes **UPVS identities** (URI + eDesk status) for two
populations:

- **Internal** users - `PhysicalEntity` rows linked to a `User`.
- **External** records - `ExternalEdeskCheck` rows fed from the **Noris** tax backend.

> [!IMPORTANT]
> There is no single FIFO queue. Every 30 seconds `processBatch()` selects work from several **prioritised tiers**, each backed by a different selector and a different UPVS endpoint, under a shared per-tick budget.

## Code map

| File                                                               | Role                                                       |
|:-------------------------------------------------------------------|:-----------------------------------------------------------|
| [`upvs-queue.service.ts`](./upvs-queue.service.ts)                 | Facade + `processBatch()` orchestration, public queue API  |
| [`urgent-lookup.service.ts`](./urgent-lookup.service.ts)           | Tier 0 - per-person identity lookup with rate-limit cutout |
| [`edesk-uri-update.service.ts`](./edesk-uri-update.service.ts)     | Tiers 1-2 - single-item URI repair (internal + external)   |
| [`edesk-batch-search.service.ts`](./edesk-batch-search.service.ts) | Tier 3 - batched URI search, success/failure persistence   |
| [`upvs-queue.queries.ts`](./upvs-queue.queries.ts)                 | Raw SQL selectors + shared exponential-backoff fragment    |

## Cron entry points

| Cadence      | Method                                                                         | Functionality                                                                                                               |
|:-------------|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| every 30s    | `TasksService.updateEdesk` -> `UpvsQueueService.processBatch`                  | Pulls one batch of work across all tiers (the scheduler described here).                                                    |
| every 30 min | `TasksService.updateEdeskInNoris` -> `EdeskTasksSubservice.updateEdeskInNoris` | Pushes `COMPLETED`/`FAILED` external results back to Noris, deletes them, refills the external queue from Noris when empty. |
| daily 09:01  | `TasksService.alertFailingEdeskUpdate`                                         | Alerts on `PhysicalEntity` rows that failed ≥ 7 times in a row.                                                             |

## The tiers

Tiers run by precedence. **Urgent runs every tick** on its own budget; the two single-item _URI-update_ tiers then **short-circuit the batch**, so the _search_ tier only runs when no URI update is pending. Palette: 🔴 urgent, 🟡 URI fix, 🟢 batched search.

| #     | Tier                      | Selector                                                                             | Items / tick                             | UPVS endpoint                          | Notes                                                                                          |
|:------|:--------------------------|:-------------------------------------------------------------------------------------|:-----------------------------------------|:---------------------------------------|:-----------------------------------------------------------------------------------------------|
| 🔴 0  | **Urgent**                | `PhysicalEntity` with `birthNumber` set and `uri IS NULL` (join `User`)              | `URGENT_BATCH_SIZE = 50`, **sequential** | `lookupIdentityFO` (per person)        | Runs first, always. Own budget. Stops the run on HTTP 429. IAM-rejected entities are excluded. |
| 🟡 1  | **Internal URI fix**      | `PhysicalEntity` with `uriPossiblyOutdated = true` (past backoff)                    | 1, then early return                     | `getIdentitiesByUris([1])`             | Re-resolves a possibly-changed URI.                                                            |
| 🟡 2  | **External URI re-check** | `ExternalEdeskCheck` with `NEW_URI_CHECK_REQUIRED`                                   | 1, then early return                     | `getIdentitiesByUris([1])`             | Re-resolves a possibly-changed external URI.                                                   |
| 🟢 3a | **High priority**         | `PhysicalEntity` with `uri` set, cache stale (`CACHE_TTL_HOURS = 144`), past backoff | ≤ `HIGH_PRIORITY_RESERVED_SLOTS = 5`     | `getIdentitiesByUris` (batched search) | Periodic eDesk-status refresh.                                                                 |
| 🟢 3b | **External**              | `ExternalEdeskCheck` with `PENDING` and `uri` set                                    | remainder of `BATCH_SIZE = 8`            | `getIdentitiesByUris` (batched search) | Shares the search batch with 3a.                                                               |

> [!NOTE]
> Tiers 3a + 3b share one batched call of ≤ `BATCH_SIZE` URIs (within the UPVS limit of 10); the urgent budget is independent of it.

## System data flow

```mermaid
%%{
  init: {
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#292e42',
      'primaryTextColor': '#c0caf5',
      'primaryBorderColor': '#7aa2f7',
      'lineColor': '#7dcfff',
      'secondaryColor': '#24283b',
      'tertiaryColor': '#1a1b26',
      'background': '#1a1b26',
      'mainBkg': '#292e42',
      'nodeBorder': '#414868',
      'clusterBkg': '#24283b',
      'clusterBorder': '#414868',
      'titleColor': '#7dcfff',
      'edgeLabelBackground': '#1a1b26'
    }
  }
}%%
flowchart TD
    NORIS[("Noris<br/>tax backend")]
    PE[("PhysicalEntity<br/>internal users")]
    EEC[("ExternalEdeskCheck<br/>external queue table")]
%% processBatch - every 30s
    PE -.->|" selected live by SQL<br/>no separate queue row "| SCHED
    EEC --> SCHED{{"processBatch<br/>every 30s"}}
    SCHED -->|" per-person, sequential "| LOOKUP[["UPVS lookupIdentityFO<br/>apiIamIdentitiesLookupGet"]]
    SCHED -->|" batched URI search, max 10 "| SEARCH[["UPVS getIdentitiesByUris<br/>apiIamIdentitiesSearchPost"]]
    LOOKUP --> SCHED
    SEARCH --> SCHED
    SCHED -->|writes uri + eDesk status| PE
    SCHED -->|writes eDesk status + death date| EEC
%% updateEdeskInNoris - every 30 min
    EEC -->|" reads COMPLETED / FAILED "| SYNC{{"updateEdeskInNoris<br/>every 30 min"}}
    SYNC -->|" push results, then delete rows "| NORIS
    NORIS -->|" refill when queue empty<br/>retrieveNewRecordsFromNorisToUpdate "| SYNC
    SYNC -->|" enqueue PENDING rows "| EEC
    classDef store fill:#24283b,stroke:#7aa2f7,color:#c0caf5;
    classDef ext fill:#3b2e42,stroke:#bb9af7,color:#c0caf5;
    classDef sched fill:#283b35,stroke:#7dcfff,color:#c0caf5;
    class PE,EEC store;
    class LOOKUP,SEARCH,NORIS ext;
    class SCHED,SYNC sched;
```

## Priority hierarchy (one tick)

```mermaid
%%{
  init: {
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#292e42',
      'primaryTextColor': '#c0caf5',
      'primaryBorderColor': '#7aa2f7',
      'lineColor': '#7dcfff',
      'secondaryColor': '#24283b',
      'tertiaryColor': '#1a1b26',
      'background': '#1a1b26',
      'mainBkg': '#292e42',
      'nodeBorder': '#414868',
      'clusterBkg': '#24283b',
      'clusterBorder': '#414868',
      'titleColor': '#7dcfff',
      'edgeLabelBackground': '#1a1b26'
    }
  }
}%%
flowchart TD
    START(["processBatch tick"]) --> T0["Tier 0 · Urgent lookup<br/>always runs, own budget of 50"]
    T0 --> RL{"urgent rate-limited?<br/>(HTTP 429)"}
    RL -->|yes| STOP(["skip lower tiers<br/>retry next tick"])
    RL -->|no| Q1{"Internal URI fix<br/>pending?"}
    Q1 -->|yes| T1["Tier 1 · fix 1 internal URI"] --> RET(["return"])
    Q1 -->|no| Q2{"External URI re-check<br/>pending?"}
    Q2 -->|yes| T2["Tier 2 · re-check 1 external URI"] --> RET
    Q2 -->|no| T3["Tier 3 · batched search<br/>high priority ≤5 + external<br/>up to BATCH_SIZE 8"]
    T3 --> END(["log report"])
    classDef urgent fill:#3b2e2e,stroke:#f7768e,color:#c0caf5;
    classDef fix fill:#3a3320,stroke:#e0af68,color:#c0caf5;
    classDef search fill:#23332a,stroke:#9ece6a,color:#c0caf5;
    class T0,RL,STOP urgent;
    class T1,T2 fix;
    class T3 search;
```

## `processUrgentItems` - sequential lookup with rate-limit handling

```mermaid
%%{
  init: {
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#292e42',
      'primaryTextColor': '#c0caf5',
      'primaryBorderColor': '#7aa2f7',
      'lineColor': '#7dcfff',
      'secondaryColor': '#24283b',
      'tertiaryColor': '#1a1b26',
      'background': '#1a1b26',
      'mainBkg': '#292e42',
      'nodeBorder': '#414868',
      'clusterBkg': '#24283b',
      'clusterBorder': '#414868',
      'titleColor': '#7dcfff',
      'edgeLabelBackground': '#1a1b26'
    }
  }
}%%
flowchart TD
    Q["SELECT up to 50 entities<br/>birthNumber set, uri NULL, past backoff"] --> LOOP{"next entity?"}
    LOOP -->|none left| WRITE["bulk DB write<br/>if rate-limited: log alert<br/>return {attempted, rateLimited, failures}"]
    LOOP -->|entity| C["getDataFromCognito"]
    C --> NAME{"given + family name?"}
    NAME -->|missing| FAIL["record failure"] --> LOOP
    NAME -->|ok| L["lookupIdentityFO"]
    L --> RES{"result?"}
    RES -->|uri returned| OK["record success"] --> LOOP
    RES -->|no uri| FAIL
    RES -->|HTTP 429| RL["set rateLimited<br/>break loop"]
    RES -->|other error| FAIL
    RL --> WRITE
    WRITE --> DONE(["return attempted count"])
    classDef rl fill:#3b2e2e,stroke:#f7768e,color:#c0caf5;
    classDef ok fill:#23332a,stroke:#9ece6a,color:#c0caf5;
    class RL rl;
    class OK ok;
```

## External item lifecycle (`ExternalEdeskCheck`)

`queueStatus` drives an external record from enqueue to Noris sync-back and deletion.

```mermaid
%%{
  init: {
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#292e42',
      'primaryTextColor': '#c0caf5',
      'primaryBorderColor': '#7aa2f7',
      'lineColor': '#7dcfff',
      'secondaryColor': '#24283b',
      'tertiaryColor': '#1a1b26',
      'background': '#1a1b26',
      'mainBkg': '#292e42',
      'nodeBorder': '#414868',
      'clusterBkg': '#24283b',
      'clusterBorder': '#414868',
      'titleColor': '#7dcfff',
      'edgeLabelBackground': '#1a1b26'
    }
  }
}%%
stateDiagram-v2
    [*] --> PENDING:enqueued from Noris
    PENDING --> COMPLETED:search success<br/>(eDesk status + death date)
    PENDING --> NEW_URI_CHECK_REQUIRED:possible URI change
    PENDING --> FAILED:search failure (failCount++)
    NEW_URI_CHECK_REQUIRED --> COMPLETED:URI re-check success
    NEW_URI_CHECK_REQUIRED --> FAILED:URI re-check failure
    COMPLETED --> [*]:pushed to Noris, row deleted
    FAILED --> [*]:reported NONEXISTENT to Noris, row deleted
```

## Internal entity eDesk lifecycle (`PhysicalEntity`)

```mermaid
%%{
  init: {
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#292e42',
      'primaryTextColor': '#c0caf5',
      'primaryBorderColor': '#7aa2f7',
      'lineColor': '#7dcfff',
      'secondaryColor': '#24283b',
      'tertiaryColor': '#1a1b26',
      'background': '#1a1b26',
      'mainBkg': '#292e42',
      'nodeBorder': '#414868',
      'clusterBkg': '#24283b',
      'clusterBorder': '#414868',
      'titleColor': '#7dcfff',
      'edgeLabelBackground': '#1a1b26'
    }
  }
}%%
flowchart TD
    START((start))
    NOURI(["NoUri"])
    REJECTED(["Rejected"])
    OUTDATED(["Outdated"])
    HASURI(["HasUri"])
    NOTE1["failCount ≥ 7 triggers the<br/>daily alertFailingEdeskUpdate cron"]:::note
    NOTE2["triggers daily alertIdentityLookupRejections cron<br/>alerts rejections from the last month"]:::note
    START -->|" birthNumber verified, uri NULL "| NOURI
    NOURI -->|" lookup fails<br/>failCount++ (backoff) "| NOURI
    NOURI -->|" Tier 0 lookupIdentityFO returns uri "| HASURI
    NOURI -->|" UPVS IAM rejects the lookup<br/>(IdentityLookupRejection row) "| REJECTED
    REJECTED -->|" manual retry<br/>delete the rejection row "| NOURI
    HASURI -->|" Tier 3a refresh after 144h<br/>(eDesk status updated) "| HASURI
    HASURI -->|" search reports possible URI change<br/>(uriPossiblyOutdated = true) "| OUTDATED
    OUTDATED -->|" Tier 1 resolves new uri "| HASURI
    OUTDATED -->|" re-resolve fails, failCount++ (backoff) "| OUTDATED
    REJECTED -.- NOTE2
    NOURI -.- NOTE1
    classDef note fill:#3a3320,stroke:#e0af68,color:#c0caf5;
```

## Tunables

| Constant                       | Value | Meaning                                                                   |
|--------------------------------|-------|---------------------------------------------------------------------------|
| `URGENT_BATCH_SIZE`            | 50    | Max urgent (per-person lookup) entities per tick, processed sequentially. |
| `BATCH_SIZE`                   | 8     | Size of the batched URI-search call (high priority + external).           |
| `HIGH_PRIORITY_RESERVED_SLOTS` | 5     | Max high-priority entities within `BATCH_SIZE`.                           |
| `CACHE_TTL_HOURS`              | 144   | How stale a high-priority entity's eDesk status may be before refresh.    |

## Backoff & resilience

- **Exponential backoff**: Tailed internal lookups bump `activeEdeskUpdateFailCount`. The selectors exclude an entity until `activeEdeskUpdateFailedAt + 2^min(failCount, 7) hours` has passed.
- **Reentrancy guard**: `isProcessingBatch` prevents a slow tick (urgent can take a while) from overlapping the next 30s cron fire.
- **Rate-limit cutout**: An HTTP 429 from the lookup endpoint is re-raised with its status kept (`fromAxiosError` status override), logged with an alert, and stops the urgent run for that tick. The caller also skips the remaining tiers for that tick so we don't keep hitting an endpoint that's already throttling us.
- **Isolation**: Per-entity lookup failures are recorded and aggregated into a single error log line, so one bad entity doesn't block the rest of the batch — the exception is a rate limit (HTTP 429), which stops the tier for the tick (see above).
- **IAM rejections**: when UPVS IAM rejects a lookup, `NasesService` persists an `IdentityLookupRejection` row (fault code/reason included). The urgent selector skips marked entities. Delete the row to retry one. A daily cron digests the last month's rejections as an alert.
