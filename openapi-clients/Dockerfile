FROM node:20.9-slim AS base

# Install Java (required for OpenAPI generator CLI)
RUN apt-get update && apt-get install -y openjdk-17-jre-headless && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev --frozen-lockfile

FROM base AS prod
COPY . ./

ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT

RUN npm run build

LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/konto.bratislava.sk/tree/master/openapi-clients" \
      org.opencontainers.image.licenses="EUPL-1.2"
