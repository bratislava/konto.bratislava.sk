ARG SHARED_PACKAGE_TAG=latest
FROM harbor.bratislava.sk/standalone/openapi-clients:${SHARED_PACKAGE_TAG} AS openapi-clients
FROM node:22.15-alpine AS base

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
WORKDIR /build
COPY package.json package-lock.json prisma ./
RUN npm ci --include=dev --frozen-lockfile \
      && npx prisma generate

FROM build-base AS build
COPY --from=openapi-clients /app/ /openapi-clients/

WORKDIR /build
COPY --chown=node:node . ./
RUN npm run build \
      && npm prune --production

FROM app-base AS dev
ENV NODE_ENV=development
# used **only** for development and local directory should be mounted
CMD [ "npm", "run", "start:debug" ]

# production
FROM app-base AS prod
# When copying node_modules from the build stage, symlinks to external dependencies
# (like ../../openapi-clients) are preserved. These symlinks expect the target directories
# to exist at specific paths in the production container. We create these directories and
# populate them with the actual content so the symlinks work correctly.
#
# Note: Using --install-links with npm ci fails because it requires the package-lock.json
# to be perfectly in sync with package.json. When dependencies have complex version
# requirements or when using local file dependencies, this synchronization often breaks,
# causing npm ci to fail with "Missing: X from lock file" or "Invalid: lock file's X does
# not satisfy Y" errors.
RUN mkdir -p /home/node/openapi-clients \
      && chown -R node:node /home/node/openapi-clients
COPY --chown=node:node --from=openapi-clients /app/ /home/node/openapi-clients

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
