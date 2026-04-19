# check=skip=InvalidDefaultArgInFrom
ARG SHARED_PACKAGE_TAG
FROM harbor.bratislava.sk/standalone/openapi-clients:${SHARED_PACKAGE_TAG} AS openapi-clients
FROM node:24.14-alpine AS base

ENV NODE_ENV=production

FROM base AS app-base
RUN apk update \
      && apk add tini \
      && rm -rf /var/cache/apk/* \
      && mkdir -p /home/node/app \
      && chown -R node:node /home/node/app
USER node
WORKDIR /home/node/app
ENTRYPOINT [ "/sbin/tini", "--" ]

FROM base AS build-base

# Temporary workaround until this repository uses npm workspaces. Locally, shared
# packages are symlinked through file: dependencies and their folders already
# contain node_modules. In CI, the copied package folders would not have
# node_modules, so we install each shared package explicitly to keep behavior
# close to local development and expose missing runtime dependencies early.
# https://github.com/bratislava/private-konto.bratislava.sk/issues/1433
WORKDIR /openapi-clients
COPY --from=openapi-clients /app/ .
RUN npm ci --include=dev

WORKDIR /build
COPY package.json package-lock.json prisma ./
RUN npm ci --include=dev \
      && npx prisma generate

FROM build-base AS build
WORKDIR /build
COPY . ./
RUN npm run build \
  && npm prune --production

FROM app-base AS dev
ENV NODE_ENV=development
# used **only** for development and local directory should be mounted
CMD [ "npm", "run", "start:debug" ]

# production
FROM app-base AS prod
COPY --chown=node:node --from=build /openapi-clients /home/node/openapi-clients

WORKDIR /home/node/app
COPY --chown=node:node --from=build /build/package.json /build/package-lock.json ./
COPY --chown=node:node --from=build /build/node_modules ./node_modules
COPY --chown=node:node --from=build /build/dist ./dist
COPY --chown=node:node --from=build /build/prisma ./prisma
COPY --chown=node:node nest-cli.json ./nest-cli.json
EXPOSE 3000
ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT
LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/konto.bratislava.sk/tree/master/nest-clamav-scanner" \
      org.opencontainers.image.licenses="EUPL-1.2"
CMD [ "npm", "run", "start:migrate:prod" ]
