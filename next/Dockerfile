ARG NODE_VERSION
ARG TURBO_VERSION
FROM node:${NODE_VERSION}-alpine AS base

ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV PNPM_HOME=/pnpm
ENV PATH="/opt/pnpm:$PNPM_HOME/bin:$PATH"

WORKDIR /app
COPY --from=pnpm-dist /opt/pnpm /opt/pnpm

FROM base AS prepare
COPY . .

ARG TURBO_VERSION
RUN pnpm dlx turbo@${TURBO_VERSION} prune city-account-next --docker

FROM base AS builder
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full/ .

ARG TURBO_API
ENV TURBO_API=$TURBO_API

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

ARG NEXT_BUILD_ENV
ENV NEXT_BUILD_ENV=$NEXT_BUILD_ENV
RUN cp "next/.env.ci-build.$NEXT_BUILD_ENV" next/.env.production.local

RUN pnpm turbo run build --filter=city-account-next

FROM node:${NODE_VERSION}-alpine AS runner
# Based on https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache tini

WORKDIR /app
RUN chown -R node:node /app

USER node

COPY --from=builder --chown=node:node /app/next/public ./next/public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/next/.next/standalone ./
COPY --from=builder --chown=node:node /app/next/.next/static ./next/.next/static

EXPOSE 3000

# tini reaps orphaned children and forwards SIGTERM. Exec-form CMD keeps `node`
# as tini's direct child, so Kubernetes rollouts can shut it down gracefully.
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "node", "next/server.js" ]
