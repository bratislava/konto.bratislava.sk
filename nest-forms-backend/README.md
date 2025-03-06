# nest-forms-backend

## Run locally

1. Run from `docker compose`:

   - RabbitMQ
   - PostgreSQL

2. Install dependencies in `/forms-shared`:

   ```bash
   npm i
   ```

   - `forms-shared` is used as a build package in `nest-forms-backend` and therefore needs to have dependencies installed and be built after dependencies are installed
   - if you already have `node_modules` or `dist` folders in `forms-shared` is good to remove them before running `npm i`

3. Build `/forms-shared`:

   ```bash
   npm run build
   ```

4. Install dependencies in `/nest-forms-backend`:

   ```bash
   npm i
   ```

5. Copy and adjust `.env` from `.env.example`, and populate secrets you need

6. If you are using a different database or a different PostgreSQL user, adjust `DATABASE_*` env vars

7. Migrate database and generate Prisma files:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

8. Choose virus scan option:

   1. Run local virus scanner:

      - copy and adjust `/nest-clamav-scanner/.env` from `/nest-clamav-scanner/.env.example`, and populate secrets you need (mainly `MINIO_SECRET_KEY`)
      - in directories `/cvdmirror`, `/clamav` and `/nest-clamav-scanner` (in this order) run:

        ```bash
        docker compose up
        ```

        > [!NOTE]
        > in case of any problems or errors, follow _Run locally_ section in respective README

      - in `/nest-forms-backend/.env` make sure that `MINIO_SAFE_BUCKET` has a different value than `MINIO_UNSCANNED_BUCKET`

   2. Fake local virus scan:
      - in `/nest-forms-backend/.env` set `MINIO_SAFE_BUCKET` to the same value as `MINIO_UNSCANNED_BUCKET`
      - every time you upload a file, go to the database and change its `status` to `SAFE` manually

9. Start dev server:

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
