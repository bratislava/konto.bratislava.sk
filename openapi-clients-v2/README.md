# openapi-clients-v2

Typed HTTP clients generated from the specs in [`openapi-specs`](../openapi-specs).

Replaces [`openapi-clients`](../openapi-clients), which is deprecated. The difference that
matters: v1 generated from **live staging URLs**, so output depended on what happened to be
deployed. This generates from committed specs, so it is reproducible and offline.

```sh
pnpm --filter openapi-clients-v2 run build      # specs -> generated/ -> dist/
pnpm --filter openapi-clients-v2 run generate   # just the first step
```

## Two steps, on purpose

`generate` turns each spec into TypeScript under `generated/`; tsdown then compiles that into
`dist/`. `build` runs both. **Neither directory is committed** — the committed artifact is the
spec, in [`openapi-specs`](../openapi-specs).

That distinction is what keeps the dependency graph acyclic. Backends import each other's
clients — `nest-clamav-scanner` uses the forms client, `nest-forms-backend` uses the
city-account client — so a client derived from a *live* backend would close a cycle. Deriving it
from a committed spec does not: generation reads a file, never a running service.

Because generation happens at build time, `openapi-generator-cli` (a Java tool) runs during the
build. The Docker build stages install a headless JRE for it; the runtime images do not.

## Importing

One wildcard subpath, so nothing has to be registered per client:

```ts
import { createFormsClient } from 'openapi-clients-v2/forms'
import { RequiredError } from 'openapi-clients-v2/magproxy'
```

`openapi-clients-v2/<name>` maps to `dist/<name>/index.js`. The generator appends `./base` to
each generated index, which is why `RequiredError` is reachable from the client itself — v1
needed a separate `magproxy/base` entry point for it.

## Build

`tsdown` in **unbundle** mode: one output file per input file, mirroring `src/`. Consumers
import a single client, so bundling everything into one chunk would make each import pull in all
six. Declarations are emitted by TypeScript 7.

## Generation steps

For each client, on top of what `openapi-generator-cli` produces:

| Step | Why |
| --- | --- |
| Drop `docs/` and its manifest entries | Not shipped |
| Synthesise `client.ts` | Exposes one `create<Name>Client({ basePath })` instead of wiring every generated `*Factory` by hand |
| Append `./client` and `./base` to `index.ts` | The generator omits both; `./base` is what removes the need for extra export entries |
| Add `Base64`/`Uuid` aliases (slovensko-sk only) | The generator emits those type names without declaring them, so the output would not compile |

Nothing is reformatted and no spec content is rewritten — the generator's output is the source
of truth.

## Specs

`forms`, `tax`, `city-account` and `clamav-scanner` come from committed files in
`openapi-specs`, written by each backend via `openapi-cli`. `slovensko-sk` and `magproxy`
describe services outside this repo and are still fetched from their upstream URLs at generation
time.
