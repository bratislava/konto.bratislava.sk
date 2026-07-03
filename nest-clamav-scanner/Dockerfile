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
RUN turbo prune nest-clamav-scanner --docker

FROM base AS builder-deps
RUN apk add --no-cache \
      ca-certificates \
      libc6-compat \
      openssl \
      tini

COPY --from=prepare /app/out/json/ .
RUN npm ci

COPY --from=prepare /app/out/full/ .

RUN npm run db:generate --prefix nest-clamav-scanner
RUN npx turbo run build --filter=nest-clamav-scanner^...
RUN npx turbo run test --filter=nest-clamav-scanner^...
RUN npx turbo run lint --filter=nest-clamav-scanner^...

FROM builder-deps AS builder
RUN npx turbo run build --filter=nest-clamav-scanner

FROM builder-deps AS test
RUN npx turbo run test --filter=nest-clamav-scanner

FROM builder AS lint
RUN npx turbo run lint --filter=nest-clamav-scanner

FROM base AS prod-deps
COPY --from=prepare /app/out/json/ .
RUN npm ci --production

FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production

RUN apk add --no-cache \
      ca-certificates \
      libc6-compat \
      openssl \
      tini

WORKDIR /app
RUN chown -R node:node /app

USER node

COPY --from=prod-deps --chown=node:node /app ./
COPY --from=builder --chown=node:node /app/nest-clamav-scanner/dist ./nest-clamav-scanner/dist
COPY --from=builder --chown=node:node /app/nest-clamav-scanner/prisma ./nest-clamav-scanner/prisma
COPY --from=builder --chown=node:node /app/nest-clamav-scanner/nest-cli.json ./nest-clamav-scanner/nest-cli.json
COPY --from=builder --chown=node:node /app/nest-clamav-scanner/prisma.config.ts ./nest-clamav-scanner/prisma.config.ts
COPY --from=builder --chown=node:node /app/openapi-clients/dist ./openapi-clients/dist

WORKDIR /app/nest-clamav-scanner

EXPOSE 3000

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "sh", "-c", "npm run db:migrate:deploy && npm run start:prod" ]
