ARG FORMS_SHARED_TAG=latest
FROM harbor.bratislava.sk/standalone/forms-shared:${FORMS_SHARED_TAG} as shared
FROM node:20.9-alpine AS base

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
      org.opencontainers.image.source="https://github.com/bratislava/konto.bratislava.sk" \
      org.opencontainers.image.licenses="EUPL-1.2"
ENTRYPOINT [ "/sbin/tini", "--" ]

# used for build-base for building only
FROM base AS build-base
WORKDIR /forms-shared
COPY --from=shared ./app ./
WORKDIR /build
COPY ./package.json ./package-lock.json ./

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
COPY --chown=node:node .env.*.local ./
COPY --chown=node:node --from=build /build/.next/standalone ./
COPY --chown=node:node --from=build /build/public ./public
COPY --chown=node:node --from=build /build/.next/static ./.next/static
CMD [ "node", "server.js" ]
