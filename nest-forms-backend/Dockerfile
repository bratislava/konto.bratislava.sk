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
RUN pnpm dlx turbo@${TURBO_VERSION} prune nest-forms-backend --docker

FROM base AS builder-deps

COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=prepare /app/out/full/ .

RUN pnpm --filter nest-forms-backend db:generate

ARG TURBO_API
ENV TURBO_API=$TURBO_API

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm turbo run build --filter=nest-forms-backend^... --filter=!nest-forms-backend

FROM builder-deps AS builder
RUN pnpm turbo run build --filter=nest-forms-backend

FROM builder-deps AS test
RUN pnpm turbo run test --filter=nest-forms-backend

FROM builder-deps AS test-e2e
ARG CI_E2E_DATABASE_URL
ENV CI_E2E_DATABASE_URL=${CI_E2E_DATABASE_URL}
RUN pnpm turbo run test:e2e --filter=nest-forms-backend

FROM builder AS lint
RUN pnpm turbo run lint --filter=nest-forms-backend

FROM base AS prod-deps
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod

FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN apk add --no-cache \
      chromium \
      tini \
      ttf-freefont

WORKDIR /app
RUN chown -R node:node /app

USER node

COPY --from=prod-deps --chown=node:node /app ./
COPY --from=builder --chown=node:node /app/nest-forms-backend/nest-cli.json ./nest-forms-backend/nest-cli.json
COPY --from=builder --chown=node:node /app/nest-forms-backend/prisma.config.ts ./nest-forms-backend/prisma.config.ts
COPY --from=builder --chown=node:node /app/nest-forms-backend/prisma ./nest-forms-backend/prisma
COPY --from=builder --chown=node:node /app/forms-shared/dist ./forms-shared/dist
COPY --from=builder --chown=node:node /app/openapi-clients/dist ./openapi-clients/dist
COPY --from=builder --chown=node:node /app/nest-forms-backend/dist ./nest-forms-backend/dist

WORKDIR /app/nest-forms-backend

EXPOSE 3000

# `exec` replaces the shell with `node`, making it tini's direct child so
# Kubernetes' SIGTERM reaches it. Without `exec` the shell dies on SIGTERM and
# tini tears the container down before `node` can drain in-flight requests.
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "sh", "-c", "./node_modules/.bin/prisma migrate deploy && exec node dist/main" ]
