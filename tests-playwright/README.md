# city-account-playwright-tests

End-to-end tests for the Next app, ported from the Cypress suite in [`../tests`](../tests).

## Running

The app must already be running with the e2e environment (`next/.env.ci-build.e2e`). The suite does
not start it — building writes `next/.env.production.local`, and a test runner should not mutate the
app package as a side effect. `globalSetup` health-checks the base URL and fails fast if it is down.

```bash
pnpm --filter city-account-playwright-tests run test
```

| Command       | What it runs                            |
| ------------- | --------------------------------------- |
| `test`        | everything: smoke + desktop + mobile    |
| `test:ui`     | Playwright UI mode                      |
| `test:report` | opens the last HTML report              |
| `lint`        | `eslint src`                            |
| `typecheck`   | `tsc` — catches schema drift, see below |

`E2E_BASE_URL` points the suite elsewhere (default `http://localhost:3000`). `E2E_VIDEO=on` records
passing tests too.

## Layout

```
src/legacy/            the Cypress port, self-contained
  specs/               one folder per Cypress e2e folder
  helpers.ts           the whole interaction vocabulary the specs use
  pages/               openForm, waitForHydration, the account flows
  fixtures/            generated identities, the per-test registered account
  data/                the smoke URL list
src/runner/            the schema-driven form runner and its single spec
src/global-setup.ts    health-checks the base URL, seeds the run id
```

Each spec's header names the Cypress file it replaces and links it at tag `prod3.30.3`, so the
original is one click away for as long as anyone needs to compare:
`https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress`.

`src/legacy/` is the whole Cypress suite, migrated roughly as-is: explicit field ids, explicit step
order, explicit `if`s for the branches. It is a closed tree — nothing in it imports from
`src/runner/`, so the runner can be deleted without touching it (the dependency runs the other way:
`runner/example-forms.spec.ts` uses `legacy/pages/FormPage`). Every legacy test is tagged `@legacy`:

```bash
playwright test --grep @legacy          # the Cypress port
playwright test --grep-invert @legacy   # everything else
```

## How the form runner works

`src/runner/` fills any form from its schema plus a typed example, rather than from hand-written
steps. `forms-shared`'s `getSummaryJsonNode` renders the form through the same RJSF pipeline the app
uses and returns a tree in which every field carries its RJSF path id — exactly the `id` that
`WidgetWrapper` puts on the wrapping element in the app. So:

- every control is addressed as `#root_<schema_path>`, never by a slugified Slovak label;
- radio and checkbox options are selected by their **schema enum value**;
- conditionals resolve themselves: `vyplnitObject.vyplnit` gates, the `pouzitKalkulacku` branches,
  and the conditional `bezpodieloveSpoluvlastnictvoManzelov` step need no test-side logic;
- the same plan doubles as the summary oracle.

Two invariants it relies on:

1. **Fill in plan order.** RJSF renders in `baOrder`, and the generator always places a gate before
   what it gates, so every conditional field is revealed before the runner reaches it.
2. **Add all array items, then fill them.** Adding remounts items and drops uncommitted react-aria
   state. Doing all the adds first is what removed the need for the "clear and re-type" passes the
   Cypress spec carried.

Filling is verified afterwards; a field that lost its value is reported rather than silently
re-typed, so drift shows up as a finding instead of a workaround.

Both styles take their values from `forms-shared/example-forms`, so neither has re-encoded JSON
fixtures, and `pnpm run typecheck` turns a schema rename into a compile error instead of a silently
passing test. Both open forms through the public `/mestske-sluzby/{slug}` entry point, because file
upload and persistence need a real form instance.

## Parallelism

Everything runs in parallel, on both devices — `Desktop Chrome` and `Pixel 5`. There is no shared
account and no serial mode: every
test that needs an account registers its own through the `registeredAccount` fixture. That is cheap
because the staging pool auto-confirms the `cypress.test` domain, so no verification e-mail is sent.

Generated identities (`src/legacy/fixtures/identity.ts`) are unique by run id + parallel index + a random
nonce. The nonce is deliberately not a counter: Playwright restarts a worker after a failure, which
would reset one.

## Known gaps

- Visual regression is not ported. Every `.matchImage()` call in the Cypress suite was commented out.
