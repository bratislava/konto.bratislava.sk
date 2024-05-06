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

## Secrets

Let's have a look if you are in the proper cluster:

```bash
kubectl config current-context
```

We are using for secrets `Sealed Secrets` https://github.com/bitnami-labs/sealed-secrets.
To use a secret in your project, you have to install `kubeseal` if you haven`t installed it yet.

```bash
brew install kubeseal
```

The next thing is going to the folder `secrets` where all our secrets are stored:

```bash
cd kubernetes/base/secrets
```

After that, we need to create a temp file for our new secrets. Let's assume we want database connection secretes. You need to make this file `database.yml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
annotation:
  sealedsecrets.bitnami.com/managed: 'true'
data:
  POSTGRES_DB: YmFuYW5h
  POSTGRES_USER: YmFuYW5h
  POSTGRES_PASSWORD: YmFuYW5h
```

- `metadata.name` is the name of the group of secrets in our case, `database-secret`
- `annotation/sealedsecrets.bitnami` add this to automatically create unsealed secret in kubernetes cluster
- `data` contains environment variables keys (`POSTGRES_DB`) and base64 encode values (`YmFuYW5h`)

For example, if you need to set up the database name to `banana`, you need to base64 encode this value. You can use an online base64 converter like https://www.base64encode.org and encode `banana` to `YmFuYW5h`.

The last thing is encrypting our secrets by kubeseal to be used on Kubernetes. You need to run this command that creates the file `database.secret.yml` where all our values are encrypted and safe to add to the repository.

```bash
kubeseal --controller-name=sealed-secrets --scope=namespace-wide --namespace=standalone --format=yaml < scanner.yml > scanner.secret.dev.yml
```

If you want to propagate a sealed secret to Kubernetes without a pipeline, you can run this command:

```bash
kubectl create -f scanner.secret.dev.yml
```

If you already have a sealed secret in Kubernetes, you can update it with the command:

```bash
kubectl apply -f database.secret.yml
```

Usually, you get this kind of error: `Error from server (AlreadyExists): error when creating "database.secret.yml": sealedsecrets.bitnami.com "nest-Prisma-template-database-secret" already exists`

If you want to check if your secret is there, you can run this command:

```bash
kubectl get secret --namespace=standalone nest-prisma-template-database-secret
```

### Database convention naming

Please use our services as database name and user the project slug. In this case, we will use `nest-prisma-template`. And for passwords, use at least 16 characters long pass with random chars.

```yml
POSTGRES_DB: nest-prisma-template
POSTGRES_USER: nest-prisma-template
POSTGRES_PASSWORD: LBcdso08b&aasd(ck2*d!p
```

which after base64 encoding looks like this:

```yml
POSTGRES_DB: bmVzdC1wcmlzbWEtdGVtcGxhdGU=
POSTGRES_USER: bmVzdC1wcmlzbWEtdGVtcGxhdGU=
POSTGRES_PASSWORD: TEJjZHNvMDhiJmFhc2QoY2syKmQhcA==
```

### Reset DB in postgres

Sometime when you have project not yet in production, and DB schema is developing, you can reset DB to apply new changes
instead of pilling migrations.

Open terminal with postgress pod and log in:

```bash
psql -U nest-forms-backend
```

then run these commands:

```bash
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO "nest-forms-backend";

```

## Stay in touch

- Website - [https://inovacie.bratislava.sk/](https://inovacie.bratislava.sk/)
