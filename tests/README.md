# E2E Cypress Tests for Next.js frontend

## Install

```sh
npm i
```

## Run App Locally in E2E Setup

The tests are configured to run against http://localhost:3000, so you must have the app running locally. You can set up your environment for end-to-end (e2e) testing by following the instructions in the [Next app README](../next/README.md), or you can quickly rebuild and restart the app using the following command from this directory:

```sh
npm run start:e2e
```

## Run Cypress Locally

To interactively open Cypress in the Chrome browser, use:

```sh
npm run cypress:open
```

To execute Cypress tests in terminal mode, use:

```sh
npm run cypress:run
```

Alternatively, you can directly use the `run-cypress.js` script with Node.js to specify additional options. This script utilizes `yargs` for command-line argument parsing, offering a more flexible way to configure your Cypress tests.

### Using run-cypress.js Script

You can run the script with the following command format:

```sh
node run-cypress.js <mode> --browser=<browser> --device=<device> --visualTesting=<visualTesting> [--baseUrl=<baseUrl>]
```

- **mode** (`open`, `run`): Specifies whether to open Cypress in interactive mode or run tests in headless mode.
- **--browser** (`Chrome`, `Edge`, `Electron`, `Firefox`): Selects the browser to run tests in.
- **--device** (`all`, `desktop`, `mobile`): Chooses the device profile for the tests.
- **--visualTesting** (`ci`, `local`): Sets the visual testing mode.
- **--baseUrl** (Optional): Overrides the default base URL (`http://localhost:3000`).

#### Examples

To open Cypress interactively in Chrome for all devices with local visual testing settings:

```sh
node run-cypress.js open --browser=chrome --device=all --visualTesting=local
```

To run Cypress tests in headless mode in Firefox for mobile devices with CI visual testing settings:

```sh
node run-cypress.js run --browser=firefox --device=mobile --visualTesting=ci
```

Remember, if you do not specify the `--baseUrl`, the script defaults to using `http://localhost:3000`.
