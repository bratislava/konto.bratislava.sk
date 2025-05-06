ARG SHARED_PACKAGE_TAG
FROM harbor.bratislava.sk/standalone/forms-shared:${SHARED_PACKAGE_TAG} as forms-shared
FROM harbor.bratislava.sk/standalone/openapi-clients:${SHARED_PACKAGE_TAG} as openapi-clients
FROM node:20.9 AS base

RUN npx playwright install-deps chromium

# build
FROM base AS build
COPY --from=forms-shared /app/ /root/forms-shared
COPY --from=openapi-clients /app/ /root/openapi-clients

WORKDIR /root/nest-forms-backend
COPY package*.json ./

RUN npm ci

COPY . ./

RUN npx prisma generate --schema=./prisma/schema.prisma

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

# When copying node_modules from the build stage, symlinks to external dependencies
# (like ../../forms-shared and ../../openapi-clients) are preserved. These symlinks expect the target directories
# to exist at specific paths in the production container. We create these directories and
# populate them with the actual content so the symlinks work correctly.
#
# Note: Using --install-links with npm ci fails because it requires the package-lock.json
# to be perfectly in sync with package.json. When dependencies have complex version
# requirements or when using local file dependencies, this synchronization often breaks,
# causing npm ci to fail with "Missing: X from lock file" or "Invalid: lock file's X does
# not satisfy Y" errors.
RUN mkdir -p /home/node/forms-shared \
    && chown -R node:node /home/node/forms-shared
RUN mkdir -p /home/node/openapi-clients \
    && chown -R node:node /home/node/openapi-clients

WORKDIR /home/node/forms-shared
COPY --chown=node:node --from=forms-shared /app/ ./

WORKDIR /home/node/openapi-clients
COPY --chown=node:node --from=openapi-clients /app/ ./

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
