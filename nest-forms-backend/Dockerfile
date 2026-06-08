# check=skip=InvalidDefaultArgInFrom
ARG FORMS_SHARED_DIGEST
ARG OPENAPI_CLIENTS_DIGEST
FROM harbor.bratislava.sk/standalone/forms-shared@${FORMS_SHARED_DIGEST} AS forms-shared
FROM harbor.bratislava.sk/standalone/openapi-clients@${OPENAPI_CLIENTS_DIGEST} AS openapi-clients
FROM node:24.15 AS base

RUN npx playwright install-deps chromium

# build
FROM base AS prebuild

# Temporary workaround until this repository uses npm workspaces. Locally, shared
# packages are symlinked through file: dependencies and their folders already
# contain node_modules. In CI, the copied package folders would not have
# node_modules, so we install each shared package explicitly to keep behavior
# close to local development and expose missing runtime dependencies early.
# https://github.com/bratislava/private-konto.bratislava.sk/issues/1433
WORKDIR /root/forms-shared
COPY --from=forms-shared / .
RUN npm ci

WORKDIR /root/openapi-clients
COPY --from=openapi-clients / .
RUN npm ci

WORKDIR /root/nest-forms-backend
COPY package*.json ./

RUN npm ci --include=dev

COPY . ./
RUN npx prisma generate --schema=./prisma/schema.prisma

FROM prebuild AS test
RUN npm run test

FROM prebuild AS lint
RUN npm run lint

FROM prebuild AS test-e2e
ARG CI_E2E_DATABASE_URL
ENV CI_E2E_DATABASE_URL=${CI_E2E_DATABASE_URL}
RUN npm run test:e2e

FROM prebuild AS build
RUN npm run build

# development
FROM base AS dev

WORKDIR /home/node/nest-forms-backend
COPY package*.json ./

RUN npm install
COPY . ./

RUN npx prisma generate

CMD [ "npm", "run", "start:debug" ]


# production
FROM base AS prod

USER node

COPY --chown=node:node --from=build /root/forms-shared /home/node/forms-shared
COPY --chown=node:node --from=build /root/openapi-clients /home/node/openapi-clients

WORKDIR /home/node/app

COPY --chown=node:node --from=build /root/nest-forms-backend/package*.json ./
COPY --chown=node:node --from=build /root/nest-forms-backend/node_modules ./node_modules
# Playwright must be installed after node_modules are copied (installs the same version as in package.json)
RUN npx playwright install chromium
RUN npm prune --production

COPY --chown=node:node --from=build /root/nest-forms-backend/dist ./dist
COPY --chown=node:node --from=build /root/nest-forms-backend/prisma ./prisma
COPY --chown=node:node nest-cli.json ./nest-cli.json

ENTRYPOINT npx prisma migrate deploy && npm run start:prod
