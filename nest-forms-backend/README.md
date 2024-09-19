# nest-forms-backend

## Run locally

1. Run from docker-compose:
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

5. Copy and adjust `.env` from `.env.example`

6. If you are using a different database or a different PostgreSQL user, adjust `DATABASE_*` env vars

7. Migrate database and generate Prisma files:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

8. Start dev server:
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

## Stay in touch

- Website - [https://inovacie.bratislava.sk/](https://inovacie.bratislava.sk/)
