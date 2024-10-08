# nest-prisma-template

Starting template for nest-prisma development under the city of Bratislava.

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

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

# Deployment
We have multiple options for deploying your app to our Kubernetes cluster.

## Pipelines
TODO

## Manual
You can use our `bratiska-cli`, which takes care of deploying the app.

1. First, install the utility:
    ```bash
    yarn global add bratislava/bratiska-cli
    ```

2. then go to folder of `/strapi` or `/next` and run just this command:
    ```bash
    bartiska-cli deploy
    ```

That`s all, everything should run automatically and if not you will be notified. You can also check [user guide of bratiska-cli](https://github.com/bratislava/bratiska-cli/blob/master/README.md).

# Development

## Prisma
- To initialize Prisma for the first time, you can run:
  (but it deletes old Prisma schema if it is available there)

```bash
prisma init
```

If you have some change in the schema.prisma, run:

```bash
npx prisma db push
```
This will update the structure. But if you have some existing data in db, you need to create migrations to propagate changes properly.

```bash
npx prisma migrate dev --name init
```
This Prisma migrates dev command generates SQL files and directly runs them against the database. In this case, the following migration files were created in the existing Prisma directory:

We are using Prisma schema with the name `schema.deployment.prisma`, which has specified build target to our Kubernetes server for deployment.



## Docker

To build the image for the development run:

```bash
docker build --target dev .
```

and for a production run:

```bash
docker build --target prod .
```

You can manually create a local image and push it to the repository if you are interested.

You can decide which image you would like to build (dev or production) based on your preference.

```bash
docker build -t harbor.bratislava.sk/standalone/nest-prisma-template:manual --target prod . 
```

Push image to harbor

```bash
docker push harbor.bratislava.sk/standalone/nest-prisma-template:manual
```

## Kustomize

If you don`t have Kustomize, please install it:

```bash
brew install kustomize
```

Generating kustomize file from source files:
```bash
 kustomize build --load-restrictor LoadRestrictionsNone kubernetes/envs/Dev | envsubst > manifest.yml
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
  sealedsecrets.bitnami.com/managed: "true"
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
kubeseal --controller-name=sealed-secrets --scope=namespace-wide --namespace=standalone --format=yaml < database.yml > database.secret.yml 
```

If you want to propagate a sealed secret to Kubernetes without a pipeline, you can run this command:
```bash
kubectl create -f database.secret.yml
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


#### Database convention naming

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


## Stay in touch

- Website - [https://inovacie.bratislava.sk/](https://inovacie.bratislava.sk/)

