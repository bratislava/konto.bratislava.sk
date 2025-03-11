# OpenAPI Clients

This package contains auto-generated TypeScript clients for various Bratislava city services.

## Limitations

It's not possible to generate OpenAPI specifications for NestJS backends without running them easily (see [this StackOverflow discussion](https://stackoverflow.com/questions/72852736/generating-swagger-json-file-without-running-nest-js-server)). Therefore, the automatic check for client updates only runs after all backend services are deployed to the staging environment on the master branch.

Running this on each commit would require spinning up all the backend services, which is resource-intensive and impractical.

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

- `npm run generate` - Generate all API clients using staging endpoints
- `npm run generate:<client>` - Generate specific client using staging endpoint (e.g., `npm run generate:forms`)
- `npm run generate:local` - Generate all API clients using local endpoints (localhost:3000)
- `npm run generate:<client>:local` - Generate specific client using local endpoint (e.g., `npm run generate:forms:local`)
- `npm run check-for-changes` - Check if any clients need to be regenerated
- `npm run build` - Build the package
- `npm run prettier` - Format code

### Using Local Endpoints

By default, the local generation scripts use `localhost:3000`. You can specify a different URL by temporarily rewriting `package.json` or by passing the `--local-url` parameter:

```bash
npm run generate:forms -- --local-url localhost:8080
```

### Adding a New Client

1. Add the client type to `validTypes` in `scripts/generateClient.ts`
2. Add the OpenAPI spec URL to `endpoints` in the same file
3. Run `npm run generate:<new-client>` to generate the client
4. Add the export path and generation scripts to `package.json`

### Checking for Changes

The `check-for-changes` script compares newly generated clients with existing ones and shows git-style diffs for any changes. This is useful for CI to ensure clients are up-to-date with their OpenAPI specs.

## License

EUPL-1.2
