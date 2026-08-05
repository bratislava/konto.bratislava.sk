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

1. Install dependencies for the whole workspace and build the shared packages this service depends on:

```bash
pnpm install
pnpm run build:dependencies
```

2. Run from docker-compose:
   - RabbitMQ
   - Postgresql (main app DB on `localhost:5422`)
   - Postgresql (Bloomreach contacts DB on `localhost:54322`)
   - Bloomreach contacts bootstrap script (`docker/postgres-init/01-bloomreach-contacts.sql`)

copy and adjust .env from .env.example

if you are using a different database or different postgres with user, adjust env `DATABASE_URL`
(also adjust `BLOOMREACH_CONTACT_DB_*` envs if Bloomreach contact DB should point elsewhere)

Migrate database and generate prisma files

```bash
pnpm exec prisma migrate dev
pnpm exec prisma generate
```

Run the app:

```bash
# development mode without auto reload
pnpm run start

# development mode with auto reload
pnpm run start:dev

# production mode
pnpm run start:prod
```

## Test

```bash
pnpm run test
```

## Used external services and tools

- Postgres Database - for data storage
- RabbitMQ - for queue processes
- Magproxy - for verifying persons by birth number and identity card
- NASES - for verifying if a person has EDESK on slovensko.sk
- Bloomreach - integration for mailing provider. Sending there events and customer changes. If you want to deactivate bloomreach integration, remove or change environment: `BLOOMREACH_INTEGRATION_STATE='ACTIVE'`
