# nest-forms-backend

## Run locally

Run from docker-compose:

- RabbitMQ
- Postgresql

Install dependencies using npm:

```bash
npm i
```

copy and adjust .env from .env.example

if you are using different database or different posgres with user, adjust `DATABASE_*` env vars

Migrate database and generate prisma files

```
npx prisma migrate dev
prisma generate
```

Start dev server

```
npm run start:dev
```

## Test

Follow the same setup as with local run.

Run the test suite that runs during

```bash
npm run test
```

Test sending pre-filled messages (forms) to UPVS FIX server

```bash
npm run test:send-form
```

Test pdf creation for tax form - output is written to gitignored `pdf-output` directory

```bash
npm run test:generate-pdf
```

## Stay in touch

- Website - [https://inovacie.bratislava.sk/](https://inovacie.bratislava.sk/)
