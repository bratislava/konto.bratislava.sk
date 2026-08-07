ARG NODE_VERSION
ARG PNPM_VERSION
ARG TURBO_VERSION
FROM node:${NODE_VERSION}-alpine AS base

ENV TURBO_TELEMETRY_DISABLED=1
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS prepare
COPY . .
ARG TURBO_VERSION
RUN pnpm dlx turbo@${TURBO_VERSION} prune city-account-strapi --docker

FROM base AS builder-deps
RUN apk add --no-cache \
      autoconf \
      automake \
      build-base \
      gcc \
      libpng-dev \
      vips-dev \
      zlib-dev

COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=prepare /app/out/full/ .

FROM builder-deps AS builder

ARG TURBO_API
ENV TURBO_API=$TURBO_API

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm turbo run build --filter=city-account-strapi

FROM base AS prod-deps
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod

FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production

# vips-dev needed according to https://docs.strapi.io/cms/installation/docker
RUN apk add --no-cache \
      tini \
      vips-dev

WORKDIR /app
RUN chown -R node:node /app

USER node

COPY --from=prod-deps --chown=node:node /app ./
COPY --from=builder --chown=node:node /app/strapi/favicon.ico ./strapi/favicon.ico
COPY --from=builder --chown=node:node /app/strapi/tsconfig.json ./strapi/tsconfig.json
COPY --from=builder --chown=node:node /app/strapi/config ./strapi/config
COPY --from=builder --chown=node:node /app/strapi/database ./strapi/database
COPY --from=builder --chown=node:node /app/strapi/public ./strapi/public
COPY --from=builder --chown=node:node /app/strapi/dist ./strapi/dist

WORKDIR /app/strapi

EXPOSE 1337

# tini reaps orphaned children and forwards SIGTERM. Exec-form CMD keeps `node`
# as tini's direct child, so Kubernetes rollouts can shut it down gracefully.
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "./node_modules/.bin/strapi", "start" ]
