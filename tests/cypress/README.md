## Run Cypress locally

You need to change the following line in /next/.env.development.local.

```
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=1x00000000000000000000BB
```

To run cypress tests locally you need to run one of the following commands.
Currently tests are running against http://localhost:3000, so the app needs to be running. You need to change the following line in .env.development.local.

```
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=1x00000000000000000000BB
```

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
