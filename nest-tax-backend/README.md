# Tax Backend

This repository contains backend code for digital real estate tax payment services (platba dane z nehnutelností) of the city of Bratislava.

# Quick run

If you want to run an application without installing it locally quickly, you can run it through `docker-compose`:

```bash
docker-compose up --build
```

# Local installation

1. Build required shared package:

```bash
# Build openapi-clients
cd ../openapi-clients/
npm install
npm run build
cd ../nest-tax-backend/
```

2. Install dependencies:

```bash
npm install
```

- For Prisma, it comes in handy to have Prisma cli. Check if it is working on your pc:

```bash
npx prisma
```

- Check the `.env` file for your correct local database connection configuration. It looks like this:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"`
```

If you have issues connecting to your Postgres, maybe you need to set timeout `connect_timeout`. Sometimes macs have problems with that:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/?connect_timeout=30&schema=public"
```

Migrate database and generate prisma files

```
npx prisma migrate dev
npx prisma generate
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

To run tests in the repo, please use these commands:

```bash
# unit tests
npm run test

# test coverage
npm run test:cov
```

# Configuration Management

## Overview

The card payment reporting system uses database-driven configuration instead of environment variables for some values.
This allows for scheduling configuration changes without deployment or manual intervention.
This was done to prevent problems with changes during weekends or holidays, since we should know about changes in these values beforehand.

## How It Works

- Settings are stored in the `Config` table
- Each configuration entry includes a `validSince` timestamp
- System automatically applies configurations when their `validSince` time is reached

## Adding New Configurations

You can use this query to create new configuration key-value pairs.
If you want to apply the setting immediately, set `validSince` to the current timestamp or leave it empty.

```postgresql
INSERT INTO "Config" (key, value, "validSince")
VALUES ('REPORTING_VARIABLE_SYMBOL', '0000000000', '2099-12-31 23:59:59'),
       ('REPORTING_SPECIFIC_SYMBOL', '0000000000', '2099-12-31 23:59:59'),
       ('REPORTING_CONSTANT_SYMBOL', '0000000000', '2099-12-31 23:59:59'),
       ('REPORTING_USER_CONSTANT_SYMBOL', '0000', '2099-12-31 23:59:59'),
       ('REPORTING_RECIPIENT_EMAIL', 'test@test.sk', '2099-12-31 23:59:59'),
       ('REPORTING_GENERATE_REPORT', 'false', '2099-12-31 23:59:59');
```
