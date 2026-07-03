ARG NODE_VERSION=24.15
FROM node:${NODE_VERSION}-alpine AS base

ENV TURBO_TELEMETRY_DISABLED=1

ARG TURBO_API
ENV TURBO_API=$TURBO_API

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

WORKDIR /app

FROM base AS prepare
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune city-account-strapi --docker

FROM base AS build-base
RUN apk add --no-cache \
      autoconf \
      automake \
      build-base \
      gcc \
      libpng-dev \
      vips-dev \
      zlib-dev

COPY --from=prepare /app/out/json/ .
RUN --mount=type=cache,target=/app/.npm \
    npm config set cache /app/.npm \
 && npm ci

COPY --from=prepare /app/out/full/ .

FROM build-base AS builder
RUN --mount=type=cache,target=/app/.npm \
    npm config set cache /app/.npm \
 && npx turbo run build --filter=city-account-strapi

FROM base AS prod-deps
COPY --from=prepare /app/out/json/ .
RUN --mount=type=cache,target=/app/.npm \
    npm config set cache /app/.npm \
 && npm ci --omit=dev

FROM node:${NODE_VERSION}-alpine AS runner
RUN apk add --no-cache \
      tini \
      vips-dev

WORKDIR /app
RUN chown -R node:node /app

USER node

ENV NODE_ENV=production
ENV PATH=/app/node_modules/.bin:/app/strapi/node_modules/.bin:$PATH

COPY --from=prod-deps --chown=node:node /app ./
COPY --from=builder --chown=node:node /app/strapi/favicon.ico ./strapi/favicon.ico
COPY --from=builder --chown=node:node /app/strapi/tsconfig.json ./strapi/tsconfig.json
COPY --from=builder --chown=node:node /app/strapi/config ./strapi/config
COPY --from=builder --chown=node:node /app/strapi/public ./strapi/public
COPY --from=builder --chown=node:node /app/strapi/dist ./strapi/dist

WORKDIR /app/strapi

EXPOSE 1337

ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT
LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/konto.bratislava.sk/tree/master/strapi" \
      org.opencontainers.image.licenses="EUPL-1.2"

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "strapi", "start" ]
