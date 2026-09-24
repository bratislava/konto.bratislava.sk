# E2E tests

End-to-end tests for the Next app, run against a locally started app and the **staging** backends.

## Running

Unless a step says otherwise, the commands run in this directory (`e2e-tests`).

### 1. Build the dependencies

```bash
pnpm run build:dependencies
```

### 2. Start the app with the e2e environment (in the `next` directory)

`next/.env.ci-build.e2e` is the environment the suite expects: the staging Cognito pool, the staging
forms and city-account backends, and `localhost` cookie storage. Both recipes below **overwrite an
env file that probably already exists** — move yours aside first.

A prod build is what the suite is tuned against, and it is what CI uses. A dev server compiles
pages on first request, which makes every first visit in a test slower:

```bash
cp .env.ci-build.e2e .env.production.local
pnpm run build && pnpm run start
```

A dev server also works, and is the better choice if you are changing the app as you iterate:

```bash
cp .env.ci-build.e2e .env.development.local
pnpm run dev
```

The suite never starts the app itself — see the `webServer` comment in `playwright.config.ts` for
why.

### 3. Install Chromium (first run only)

```bash
pnpm exec playwright install chromium
```

### 4. Run

```bash
pnpm run test
```

Useful flags: `--project=smoke|desktop|mobile`, `--grep <pattern>`, `--headed`, `--debug`,
`--ui`, and `--last-failed`.

## What a run does to staging

Every test that needs an account registers its own, so there is no shared account and no ordering
between tests. That is cheap because the staging Cognito pool auto-confirms the `cypress.test`
domain — no verification e-mail is sent — but it does mean a run leaves behind accounts, form drafts
and uploaded files on staging. Generated addresses are `e2e-<runId>-<workerIndex>-<nonce>@cypress.test`,
and `globalSetup` prints the run id, so one run's leftovers are identifiable.

## The Cypress migration

This package replaces the Cypress suite that lived in `../tests`. All fourteen of its specs have a
counterpart here, in `src/legacy/specs/`, tagged `@legacy`.

Every spec header links the Cypress file it replaces, pinned at tag `prod3.30.3` so the original
stays reachable now that `../tests` is deleted:

```
https://github.com/bratislava/konto.bratislava.sk/tree/prod3.30.3/tests/cypress
```

### Migrating off the legacy tests

These specs are a near-as-is port, kept deliberately dumb: hardcoded field ids, hardcoded step order,
explicit `if`s for the branches. They exist so Cypress could be deleted, not as a model to follow.
What carries Cypress baggage and should go with them:

1. **`data-cy` selectors.** Fields are addressed with CSS attribute selectors. Playwright's own way is
   `use: { testIdAttribute: 'data-cy' }` plus `getByTestId`. Renaming the attribute to `data-testid`
   in the app is a separate change.
2. **The `@cypress.test` e-mail domain.** Generated identities have to use it because the staging
   Cognito pool auto-confirms exactly that domain, which is what keeps registration free of
   verification e-mails. Renaming it to something like `e2e.test` is a pool configuration change.
