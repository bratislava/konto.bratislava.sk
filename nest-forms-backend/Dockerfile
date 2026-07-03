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
RUN turbo prune nest-forms-backend --docker

FROM base AS builder-deps
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN apk add --no-cache \
      ca-certificates \
      chromium \
      freetype \
      harfbuzz \
      libc6-compat \
      nss \
      openssl \
      qpdf \
      tini \
      ttf-freefont

COPY --from=prepare /app/out/json/ .
RUN npm ci

COPY --from=prepare /app/out/full/ .

RUN npm run db:generate --prefix nest-forms-backend
RUN npx turbo run build --filter=nest-forms-backend^...
RUN npx turbo run test --filter=nest-forms-backend^...
RUN npx turbo run lint --filter=nest-forms-backend^...

FROM builder-deps AS builder
RUN npx turbo run build --filter=nest-forms-backend

FROM builder-deps AS test
RUN npx turbo run test --filter=nest-forms-backend

FROM builder-deps AS test-e2e
ARG CI_E2E_DATABASE_URL
ENV CI_E2E_DATABASE_URL=${CI_E2E_DATABASE_URL}
RUN npx turbo run test:e2e --filter=nest-forms-backend

FROM builder AS lint
RUN npx turbo run lint --filter=nest-forms-backend

FROM base AS prod-deps
COPY --from=prepare /app/out/json/ .
RUN npm ci --production

FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN apk add --no-cache \
      ca-certificates \
      chromium \
      freetype \
      harfbuzz \
      libc6-compat \
      nss \
      openssl \
      qpdf \
      tini \
      ttf-freefont

WORKDIR /app
RUN chown -R node:node /app

USER node

COPY --from=prod-deps --chown=node:node /app ./
COPY --from=builder --chown=node:node /app/nest-forms-backend/dist ./nest-forms-backend/dist
COPY --from=builder --chown=node:node /app/nest-forms-backend/prisma ./nest-forms-backend/prisma
COPY --from=builder --chown=node:node /app/nest-forms-backend/nest-cli.json ./nest-forms-backend/nest-cli.json
COPY --from=builder --chown=node:node /app/nest-forms-backend/prisma.config.ts ./nest-forms-backend/prisma.config.ts
COPY --from=builder --chown=node:node /app/forms-shared/dist ./forms-shared/dist
COPY --from=builder --chown=node:node /app/openapi-clients/dist ./openapi-clients/dist

WORKDIR /app/nest-forms-backend

EXPOSE 3000

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "sh", "-c", "npm run db:migrate:deploy && npm run start:prod" ]
