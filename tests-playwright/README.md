# city-account-playwright-tests

End-to-end tests for the Next app, ported from the Cypress suite in [`../tests`](../tests).

## Running

The app must already be running with the e2e environment (`next/.env.ci-build.e2e`). The suite does
not start it — building writes `next/.env.production.local`, and a test runner should not mutate the
app package as a side effect. `globalSetup` health-checks the base URL and fails fast if it is down.

```bash
pnpm --filter city-account-playwright-tests run test:playwright
```

| Command                               | What it runs                            |
| ------------------------------------- | --------------------------------------- |
| `test:playwright`                     | everything: smoke + desktop + mobile    |
| `test:playwright:smoke`               | six URL status checks, no browser       |
| `test:playwright:desktop` / `:mobile` | one viewport                            |
| `test:playwright:ui`                  | Playwright UI mode                      |
| `typecheck`                           | `tsc` — catches schema drift, see below |

`E2E_BASE_URL` points the suite elsewhere (default `http://localhost:3000`). `E2E_VIDEO=on` records
passing tests too.

## How the form tests work

`src/engine/` fills any form from its schema plus a typed example, rather than from hand-written
steps. `forms-shared`'s `getSummaryJsonNode` renders the form through the same RJSF pipeline the app
uses and returns a tree in which every field carries its RJSF path id — exactly the `id` that
`WidgetWrapper` puts on the wrapping element in the app. So:

- every control is addressed as `#root_<schema_path>`, never by a slugified Slovak label;
- radio and checkbox options are selected by their **schema enum value**;
- conditionals resolve themselves: `vyplnitObject.vyplnit` gates, the `pouzitKalkulacku` branches,
  and the conditional `bezpodieloveSpoluvlastnictvoManzelov` step need no test-side logic;
- the same plan doubles as the summary oracle.

Scenarios come from `forms-shared/example-forms`, so the data is typed as `TaxFormData` and
`pnpm run typecheck` turns a schema rename into a compile error instead of a silently passing test.

Two invariants the engine relies on:

1. **Fill in plan order.** RJSF renders in `baOrder`, and the generator always places a gate before
   what it gates, so every conditional field is revealed before the engine reaches it.
2. **Add all array items, then fill them.** Adding remounts items and drops uncommitted react-aria
   state. Doing all the adds first is what removed the need for the "clear and re-type" passes the
   Cypress spec carried.

Filling is verified afterwards; a field that lost its value is reported rather than silently
re-typed, so drift shows up as a finding instead of a workaround.

## Entry points

Form-filling tests use `/mestske-sluzby/dev/{slug}`, which renders the form straight from the schema
with no form instance and no backend. Nothing is created, nothing is shared, so the matrix runs fully
in parallel. Scenarios that upload a file need a real form instance, and `requiresBackend()` routes
those through the public `/mestske-sluzby/{slug}` entry point automatically.

## Parallelism

Everything runs in parallel, on both viewports. There is no shared account and no serial mode: every
test that needs an account registers its own through the `registeredAccount` fixture. That is cheap
because the staging pool auto-confirms the `cypress.test` domain, so no verification e-mail is sent.

Generated identities (`src/fixtures/identity.ts`) are unique by run id + parallel index + a random
nonce. The nonce is deliberately not a counter: Playwright restarts a worker after a failure, which
would reset one.

## Known gaps

- `registracia-modal.spec.ts` covers only the SIZ slug; `zavazne-stanovisko-k-investicnej-cinnosti`
  still renders the legacy landing page, which has no fill-form CTA at all.
- Visual regression is not ported. Every `.matchImage()` call in the Cypress suite was commented out.
