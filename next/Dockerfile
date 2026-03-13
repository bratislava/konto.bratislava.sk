# check=skip=InvalidDefaultArgInFrom
ARG SHARED_PACKAGE_TAG
FROM harbor.bratislava.sk/standalone/forms-shared:${SHARED_PACKAGE_TAG} AS forms-shared
FROM harbor.bratislava.sk/standalone/openapi-clients:${SHARED_PACKAGE_TAG} AS openapi-clients
FROM node:24.14-alpine AS base

# used as app-base in prodution and development image
FROM base AS app-base
RUN apk add --no-cache tini
RUN mkdir -p /home/node/app \
 && chown node:node /home/node/app
USER node
WORKDIR /home/node/app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
EXPOSE 3000
ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT
LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/konto.bratislava.sk/tree/master/next" \
      org.opencontainers.image.licenses="EUPL-1.2"
ENTRYPOINT [ "/sbin/tini", "--" ]

# used for build-base for building only
FROM base AS build-base
WORKDIR /forms-shared
COPY --from=forms-shared /app/ ./
WORKDIR /openapi-clients
COPY --from=openapi-clients /app/ ./
WORKDIR /build
COPY ./package.json ./package-lock.json ./
COPY ./patches ./patches

FROM build-base AS install-prod
ENV NPM_CONFIG_CACHE=/build/.npm
RUN --mount=type=cache,target=/build/.npm \
    npm config set cache /build/.npm \
 && npm ci --omit=dev --frozen-lockfile

FROM install-prod AS build
COPY . ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=cache,target=/build/.npm \
    npm config set cache /build/.npm \
    && npm ci --include=dev --frozen-lockfile \
    && npm run build

FROM app-base AS dev
ENV NODE_ENV=development
COPY --chown=node:node --from=build /build/node_modules ./node_modules
CMD [ "npm run", "develop" ]

FROM app-base AS prod
# Turbopack with `turbopack.root` set to parent produces nested standalone output:
# .next/standalone/{build,forms-shared,openapi-clients}/ with server.js inside build/
COPY --chown=node:node --from=build /build/.next/standalone ./
COPY --chown=node:node .env.*.local ./build/
# https://github.com/i18next/next-i18next?tab=readme-ov-file#docker
COPY --chown=node:node --from=build /build/next-i18next.config.js ./build/
COPY --chown=node:node --from=build /build/public ./build/public
COPY --chown=node:node --from=build /build/.next/static ./build/.next/static
CMD [ "node", "build/server.js" ]
