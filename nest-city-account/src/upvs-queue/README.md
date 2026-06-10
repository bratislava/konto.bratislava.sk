# UPVS multi-tier priority work scheduler

`UpvsQueueService` resolves and refreshes **UPVS identities** (URI + eDesk status) for two
populations:

- **Internal** users - `PhysicalEntity` rows linked to a `User`.
- **External** records - `ExternalEdeskCheck` rows fed from the **Noris** tax backend.

There is no single FIFO queue. Instead, every 30 seconds `processBatch()` selects work from
several **prioritised tiers**, each backed by a different selector and a different UPVS endpoint,
under a shared per-tick budget. This document describes those tiers, the item lifecycles, and the
control flow.

## Cron entry points

| Cadence      | Method                                                                         | Functionality                                                                                                               |
|:-------------|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| every 30s    | `TasksService.updateEdesk` -> `UpvsQueueService.processBatch`                  | Pulls one batch of work across all tiers (the scheduler described here).                                                    |
| every 30 min | `TasksService.updateEdeskInNoris` -> `EdeskTasksSubservice.updateEdeskInNoris` | Pushes `COMPLETED`/`FAILED` external results back to Noris, deletes them, refills the external queue from Noris when empty. |
| daily 09:01  | `TasksService.alertFailingEdeskUpdate`                                         | Alerts on `PhysicalEntity` rows that failed ≥ 7 times in a row.                                                             |

## The tiers

Tiers are listed by precedence. **Urgent runs on every tick** with its own budget. After it, the
two single-item _URI-update_ tiers **short-circuit the batch** (they handle one item and return),
so the _search_ tier only runs on ticks where no URI update is pending.

| #  | Tier                      | Selector                                                                             | Items / tick                             | UPVS endpoint                   | Notes                                                      |
|----|---------------------------|--------------------------------------------------------------------------------------|------------------------------------------|---------------------------------|------------------------------------------------------------|
| 0  | **Urgent**                | `PhysicalEntity` with `birthNumber` set and `uri IS NULL` (join `User`)              | `URGENT_BATCH_SIZE = 50`, **sequential** | `lookupIdentityFO` (per person) | Runs first, always. Own budget. Stops the run on HTTP 429. |
| 1  | **Internal URI fix**      | `PhysicalEntity` with `uriPossiblyOutdated = true` (past backoff)                    | 1, then early return                     | `createMany([1])`               | Re-resolves a possibly-changed URI.                        |
| 2  | **External URI re-check** | `ExternalEdeskCheck` with `NEW_URI_CHECK_REQUIRED`                                   | 1, then early return                     | `createMany([1])`               | Re-resolves a possibly-changed external URI.               |
| 3a | **High priority**         | `PhysicalEntity` with `uri` set, cache stale (`CACHE_TTL_HOURS = 144`), past backoff | ≤ `HIGH_PRIORITY_RESERVED_SLOTS = 5`     | `createMany` (batched search)   | Periodic eDesk-status refresh.                             |
| 3b | **External**              | `ExternalEdeskCheck` with `PENDING` and `uri` set                                    | remainder of `BATCH_SIZE = 8`            | `createMany` (batched search)   | Shares the search batch with 3a.                           |

> Tiers 3a + 3b together form a single batched call of ≤ `BATCH_SIZE` (8) URIs, which is within the
> UPVS search limit of 10. The **urgent** budget is fully independent of `BATCH_SIZE`.

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
    SCHED -->|" batched URI search, max 10 "| SEARCH[["UPVS createMany<br/>apiIamIdentitiesSearchPost"]]
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

## `processBatch` control flow

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
    A(["cron, every 30s"]) --> G{"isProcessingBatch?"}
    G -->|yes| SKIP["log skip, return<br/>(reentrancy guard)"]
    G -->|no| LOCK["isProcessingBatch = true"]
    LOCK --> U["processUrgentItems(50)<br/>sequential lookup"]
    U --> RL{"urgent rate-limited?<br/>(HTTP 429)"}
    RL -->|yes| RLR["skip remaining tiers<br/>return, retry next tick"]
    RL -->|no| Q1{"getUriToUpdateInternal<br/>found?"}
    Q1 -->|yes| H1["handleUriUpdateInternal<br/>resolve 1 URI"] --> LOG["log report"]
    Q1 -->|no| Q2{"getUriToUpdateExternal<br/>found?"}
    Q2 -->|yes| H2["handleUriUpdateExternal<br/>resolve 1 URI"] --> LOG
    Q2 -->|no| HP["getHighPriorityQueueItems(≤5)"]
    HP --> EX["getExternalQueueItems<br/>(8 − highPriority)"]
    EX --> EMPTY{"any URIs to search?"}
    EMPTY -->|no| LOG
    EMPTY -->|yes| CM["nasesService.createMany"]
    CM --> S["handleSuccessfulUpdates"]
    S --> F["handleFailureCases"]
    F --> LOG
    LOG --> UNLOCK["finally: isProcessingBatch = false"]
    RLR --> UNLOCK
    SKIP --> ENDN(["end"])
    UNLOCK --> ENDN
    classDef guard fill:#3b2e2e,stroke:#f7768e,color:#c0caf5;
    class G,SKIP,LOCK,UNLOCK,RL,RLR guard;
```

## `processUrgentItems` - sequential lookup with rate-limit handling

Urgent items use the per-person lookup endpoint. They are processed **one at a time** (not in
parallel), so the load on the endpoint is steady. An HTTP 429 from the endpoint stops the whole
run; the remaining entities are retried next tick.

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
stateDiagram-v2
    [*] --> NoUri:birthNumber verified, uri NULL
    NoUri --> HasUri:Tier 0 lookupIdentityFO returns uri
    NoUri --> NoUri:lookup fails, failCount++ (backoff)
    HasUri --> HasUri:Tier 3a refresh after 144h<br/>(eDesk status updated)
    HasUri --> Outdated:search reports possible URI change<br/>(uriPossiblyOutdated = true)
    Outdated --> HasUri:Tier 1 resolves new uri
    Outdated --> Outdated:re-resolve fails, failCount++ (backoff)
    note right of NoUri
        failCount ≥ 7 triggers the
        daily alertFailingEdeskUpdate cron
    end note
```

## Tunables

| Constant                       | Value | Meaning                                                                   |
|--------------------------------|-------|---------------------------------------------------------------------------|
| `URGENT_BATCH_SIZE`            | 50    | Max urgent (per-person lookup) entities per tick, processed sequentially. |
| `BATCH_SIZE`                   | 8     | Size of the batched URI-search call (high priority + external).           |
| `HIGH_PRIORITY_RESERVED_SLOTS` | 5     | Max high-priority entities within `BATCH_SIZE`.                           |
| `CACHE_TTL_HOURS`              | 144   | How stale a high-priority entity's eDesk status may be before refresh.    |

## Backoff & resilience

- **Exponential backoff**: failed internal lookups bump `activeEdeskUpdateFailCount`; the selectors
  exclude an entity until `activeEdeskUpdateFailedAt + 2^min(failCount, 7) hours` has passed.
- **Reentrancy guard**: `isProcessingBatch` prevents a slow tick (urgent can take a while) from
  overlapping the next 30s cron fire.
- **Rate-limit cutout**: an HTTP 429 from the lookup endpoint is re-raised with its status kept
  (`fromAxiosError` status override), logged with an alert, and stops the urgent run for that
  tick. The caller also skips the remaining tiers for that tick so we don't keep hitting an
  endpoint that's already throttling us.
- **Isolation**: per-entity failures are recorded and aggregated into a single error log line; one
  bad entity never blocks the rest of the batch.
