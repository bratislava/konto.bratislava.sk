# Tax Backend

This repository contains backend code for digital real estate tax payment services (platba dane z nehnutelností) of the city of Bratislava.

# Quick run

If you want to run an application without installing it locally quickly, you can run it through `docker-compose`:

```bash
docker-compose up --build
```

# Local installation

- Run npm installation for dependencies

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
