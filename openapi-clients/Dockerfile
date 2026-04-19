FROM node:24.14-slim AS base

WORKDIR /app

FROM base AS prod-build

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . ./
RUN npm run build

FROM scratch AS prod

COPY --from=prod-build /app/package.json ./package.json
COPY --from=prod-build /app/package-lock.json ./package-lock.json
COPY --from=prod-build /app/dist ./dist

