FROM node:20.19-slim AS base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev --frozen-lockfile

FROM base AS prod
COPY . ./
RUN npm run build

ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT
LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/konto.bratislava.sk/tree/master/openapi-clients" \
      org.opencontainers.image.licenses="EUPL-1.2"
