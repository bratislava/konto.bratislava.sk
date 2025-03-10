# OpenAPI Clients

This package contains auto-generated TypeScript clients for various Bratislava city services.

## Available Clients

- `city-account` - City Account service client
- `forms` - Forms service client
- `tax` - Tax service client
- `clamav-scanner` - ClamAV Scanner service client
- `slovensko-sk` - Slovensko.sk API client

## Development

### Prerequisites

- Node.js >=20.9.x
- npm >=10.7.x

### Scripts

- `npm run generate` - Generate all API clients
- `npm run generate:<client>` - Generate specific client (e.g., `npm run generate:forms`)
- `npm run check-for-changes` - Check if any clients need to be regenerated
- `npm run build` - Build the package
- `npm run prettier` - Format code

### Adding a New Client

1. Add the client type to `validTypes` in `scripts/generateClient.ts`
2. Add the OpenAPI spec URL to `endpoints` in the same file
3. Run `npm run generate:<new-client>` to generate the client
4. Add the export path to `package.json`

### Checking for Changes

The `check-for-changes` script compares newly generated clients with existing ones and shows git-style diffs for any changes. This is useful for CI to ensure clients are up-to-date with their OpenAPI specs.

## License

EUPL-1.2
