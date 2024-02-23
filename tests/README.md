## Run app locally in e2e setup

Currently tests are running against http://localhost:3000, so the app needs to be running. Either follow the e2e setup in [next app readme](../next/README.md), or rebuild & restart via the following npm script from this directory:

```
yarn start:e2e
```

## Run Cypress locally

```
npm run cypress:open //for open mode (Running tests in chrome browser)
```

```
npm run cypress:run // for terminal mode
```

or

```
./cypress.sh <mode> <browser> <device> <baseUrl>

Modes: Open, Run
Browsers: Chrome, Edge, Electron, Firefox
Devices: all, desktop, mobile
BaseUrl: Optional

Example: ./cypress.sh open chrome all
```
