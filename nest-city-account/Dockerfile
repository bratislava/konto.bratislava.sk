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
RUN turbo prune nest-city-account --docker

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

RUN npm run db:generate --prefix nest-city-account
RUN npx turbo run build --filter=nest-city-account^...
RUN npx turbo run test --filter=nest-city-account^...
RUN npx turbo run lint --filter=nest-city-account^...

FROM builder-deps AS builder
RUN npx turbo run build --filter=nest-city-account

FROM builder-deps AS test
RUN npx turbo run test --filter=nest-city-account

FROM builder AS lint
RUN npx turbo run lint --filter=nest-city-account

FROM base AS prod-deps
COPY --from=prepare /app/out/json/ .
RUN npm ci  --production

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
COPY --from=builder --chown=node:node /app/nest-city-account/dist ./nest-city-account/dist
COPY --from=builder --chown=node:node /app/nest-city-account/prisma ./nest-city-account/prisma
COPY --from=builder --chown=node:node /app/nest-city-account/nest-cli.json ./nest-city-account/nest-cli.json
COPY --from=builder --chown=node:node /app/nest-city-account/prisma.config.ts ./nest-city-account/prisma.config.ts
COPY --from=builder --chown=node:node /app/openapi-clients/dist ./openapi-clients/dist

WORKDIR /app/nest-city-account

EXPOSE 3000

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "npm", "run", "start:migrate:prod" ]
