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
RUN pnpm dlx turbo@${TURBO_VERSION} prune nest-city-account --docker

FROM base AS builder-deps

# openapi-clients generates its TypeScript from the committed specs at build time, and
# openapi-generator-cli is a Java tool. Headless JRE only, and only in the build stages —
# `runner` starts from a clean node image, so this never reaches the shipped image.
RUN apk add --no-cache openjdk21-jre-headless

COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=prepare /app/out/full/ .

RUN pnpm --filter nest-city-account db:generate

ARG TURBO_API
ENV TURBO_API=$TURBO_API

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm turbo run build --filter=nest-city-account^... --filter=!nest-city-account

FROM builder-deps AS builder
RUN pnpm turbo run build --filter=nest-city-account

FROM builder-deps AS test
RUN pnpm turbo run test --filter=nest-city-account

FROM builder AS lint
RUN pnpm turbo run lint --filter=nest-city-account

# Fails when the committed OpenAPI spec no longer matches this service's code.
# `builder-deps` already has openapi-cli built and openapi-specs in the pruned
# context, because openapi-cli depends on it.
FROM builder-deps AS openapi
RUN pnpm turbo run openapi:validate --filter=nest-city-account

# Rewrites the spec instead of checking it, for the `/openapi` pull request
# command -- see .github/workflows/openapi-chatops.yml.
#
# Run through pnpm rather than turbo, unlike every other stage here: the spec is
# written to the openapi-specs package, outside this backend's own directory, so
# turbo cannot declare it as a task output. A cache hit would then replay a
# recorded log without writing anything and the stale spec would be committed as
# if it were fresh.
FROM builder-deps AS openapi-generate
RUN pnpm --filter nest-city-account run openapi

# Scratch, so `--output type=local` writes the regenerated spec and nothing else.
FROM scratch AS openapi-spec
COPY --from=openapi-generate /app/openapi-specs/city-account.json /

FROM base AS prod-deps
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod

FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN apk add --no-cache \
      chromium \
      qpdf \
      tini \
      ttf-freefont

WORKDIR /app
RUN chown -R node:node /app

USER node

COPY --from=prod-deps --chown=node:node /app ./
COPY --from=builder --chown=node:node /app/nest-city-account/nest-cli.json ./nest-city-account/nest-cli.json
COPY --from=builder --chown=node:node /app/nest-city-account/prisma.config.ts ./nest-city-account/prisma.config.ts
COPY --from=builder --chown=node:node /app/nest-city-account/prisma ./nest-city-account/prisma
COPY --from=builder --chown=node:node /app/openapi-clients/dist ./openapi-clients/dist
COPY --from=builder --chown=node:node /app/nest-city-account/dist ./nest-city-account/dist

WORKDIR /app/nest-city-account

EXPOSE 3000

# `exec` replaces the shell with `node`, making it tini's direct child so
# Kubernetes' SIGTERM reaches it. Without `exec` the shell dies on SIGTERM and
# tini tears the container down before `node` can drain in-flight requests.
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "sh", "-c", "./node_modules/.bin/prisma migrate deploy && exec node dist/main" ]
