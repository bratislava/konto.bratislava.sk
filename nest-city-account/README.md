# City Account Backend

This repository contains backend code of City Account project.

## Product specification

[Product specification](https://magistratba.sharepoint.com/:w:/s/InnovationTeam/Ee7urGwpSLBGnhyBYT5OJyAB9yPAd8xctA2I_xU6rYWbuA?e=ofobAR)

## Development

First of all, duplicate `.env.example` file as `.env` by running following command:

```bash
cp .env.example .env
```

Adjust the values as you need. (all secret variables)

### Run locally

Run from docker-compose:

- RabbitMQ
- Postgresql

Install dependencies using npm:

```bash
npm i
```

copy and adjust .env from .env.example

if you are using different database or different posgres with user, adjust env `DATABASE_URL`

Migrate database and generate prisma files

```
npx prisma migrate dev
prisma generate
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

```
npm run test
```

## Used external services and tools

- Postgre Database - for data storage
- RabbitMQ - for queue processes
- Magproxy - for verifying persons by birth number and identity card
- NASES - for verifying if person has EDESK on slovensko.sk
- Bloomreach - integration for mailing provider. Sending there events and customer changes. If you want deactivate bloomreach integration, just remove or change environment: `BLOOMREACH_INTEGRATION_STATE='ACTIVE'`
