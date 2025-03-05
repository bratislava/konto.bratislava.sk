# nest-forms-backend

## Run locally

1. Run from docker-compose:

   - RabbitMQ
   - PostgreSQL

2. Install and build required shared packages:

   ```bash
   # Build forms-shared
   cd ../forms-shared/
   npm install
   npm run build

   # Build openapi-clients
   cd ../openapi-clients/
   npm install
   npm run build

   cd ../nest-forms-backend/
   ```

3. Install dependencies in `/nest-forms-backend`:

   ```bash
   npm install
   ```

4. Copy and adjust `.env` from `.env.example`

5. If you are using a different database or a different PostgreSQL user, adjust `DATABASE_*` env vars

6. Migrate database and generate Prisma files:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

7. Start dev server:
   ```bash
   npm run start:dev
   ```

## Test

Follow the same setup as with the local run.

Run the test suite:

```bash
npm run test
```

Test sending pre-filled messages (forms) to UPVS FIX server:

```bash
npm run test:send-form
```

Test PDF creation for tax form - output is written to gitignored `pdf-output` directory:

```bash
npm run test:generate-pdf
```
