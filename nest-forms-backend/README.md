# nest-forms-backend

## Run locally
1. Run from docker-compose:

   - RabbitMQ
   - Postgresql

2. Install dependencies in `/forms-shared`:
    ```bash
    npm i
    ```
   (`forms-shared` as a build package is used in `nest-forms-backend` and therefore it needs to have installed dependencies and is build after dependencies are installed)

2. Build `/forms-shared`:
    ```bash
    npm run build
    ```

4. Install dependencies in `/nest-forms-backend`:

    ```bash
    npm i
    ```

5. copy and adjust .env from .env.example

6. if you are using a different database or different posgres with user, adjust `DATABASE_*` env vars

7. Migrate database and generate prisma files

    ```
    npx prisma migrate dev
    prisma generate
    ```

8. Start dev server

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
