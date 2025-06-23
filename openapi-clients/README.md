# OpenAPI Clients

This package contains auto-generated TypeScript clients for various Bratislava city services.

## Limitations

It's not possible to generate OpenAPI specifications for NestJS backends in the build pipeline easily. Therefore, the automatic check for client updates only runs after all backend services are deployed to the staging environment on the master branch.

## Available Clients

- `city-account` - City Account service client
- `forms` - Forms service client
- `tax` - Tax service client
- `clamav-scanner` - ClamAV Scanner service client
- `slovensko-sk` - Slovensko.sk API client

## Development

### Prerequisites

- Java JDK 11+ (OpenAPI Generator requires Java to run)
- For local generation: Node.js and npm installed in backend projects

### Scripts

- `npm run generate` - Generate all API clients using staging endpoints
- `npm run generate:<client>` - Generate specific client using staging endpoint (e.g., `npm run generate:forms`)
- `npm run generate:<client>:local` - Generate specific client using local API spec (e.g., `npm run generate:forms:local`)
- `npm run check-for-changes` - Check if any clients need to be regenerated
- `npm run build` - Build the package
- `npm run prettier` - Format code

### Using Local API Specs

The `--local` flag generates API clients from locally generated OpenAPI specifications rather than remote endpoints. This approach:

1. Runs `npm run generate-api-spec` in the corresponding backend project
2. Uses the generated API spec file to create the client
3. Cleans up temporary files automatically

**Prerequisites for local generation:**

- Backend projects must have npm dependencies installed
- Environment variables must be properly configured for the backend to initialize
- The backend project must support the `generate-api-spec` npm script

**Note:** The `slovensko-sk` client does not support local generation as it's an external API.

### Adding a New Client

1. Add the client type to `validTypes` in `scripts/generateClient.ts`
2. Add the OpenAPI spec URL to `endpoints` in the same file
3. For local generation support, add the backend folder mapping to `localFolders` and implement the support in the respective backend.
4. Run `npm run generate:<new-client>` to generate the client
5. Add the export path and generation scripts to `package.json`

### Checking for Changes

The `check-for-changes` script compares newly generated clients with existing ones and shows git-style diffs for any changes. This is useful for CI to ensure clients are up-to-date with their OpenAPI specs.

## License

EUPL-1.2
