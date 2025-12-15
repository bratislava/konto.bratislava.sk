# City Account Backend

This repository contains backend code of the City Account project.

## Product specification

[Product specification](https://magistratba.sharepoint.com/:w:/s/InnovationTeam/Ee7urGwpSLBGnhyBYT5OJyAB9yPAd8xctA2I_xU6rYWbuA?e=ofobAR)

## Development

First, duplicate `.env.example` file as `.env` by running the following command:

```bash
cp .env.example .env
```

Adjust the values as you need. (all secret variables)

### Run locally

1. Build required shared package:

```bash
# Build openapi-clients
cd ../openapi-clients/
npm install
npm run build
cd ../nest-city-account/
```

2. Run from docker-compose:

   - RabbitMQ
   - Postgresql

3. Install dependencies:

```bash
npm install
```

copy and adjust .env from .env.example

if you are using a different database or different postgres with user, adjust env `DATABASE_URL`

Migrate database and generate prisma files

```
npx prisma migrate dev
npx prisma generate
```

Run the app:

```bash
# development mode without auto reload
npm run start

# development mode with auto reload
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
npm run test
```

## Used external services and tools

- Postgres Database - for data storage
- RabbitMQ - for queue processes
- Magproxy - for verifying persons by birth number and identity card
- NASES - for verifying if a person has EDESK on slovensko.sk
- Bloomreach - integration for mailing provider. Sending there events and customer changes. If you want to deactivate bloomreach integration, remove or change environment: `BLOOMREACH_INTEGRATION_STATE='ACTIVE'`
