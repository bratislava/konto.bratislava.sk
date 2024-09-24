# If FORMS_SHARED_TAG is not specified, use general "latest"
ARG FORMS_SHARED_TAG=latest
FROM harbor.bratislava.sk/standalone/forms-shared:${FORMS_SHARED_TAG} AS shared

FROM node:20.10 AS base
ENV NODE_ENV=production

# Used as app-base in production and development image
FROM base AS app-base
RUN apt-get update \
 && apt-get install -y tini \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /home/node/app \
 && chown -R node:node /home/node/app
USER node
WORKDIR /home/node/app
ENTRYPOINT [ "/usr/bin/tini", "--" ]

FROM base AS build-base
COPY --from=shared /app/ /forms-shared/

WORKDIR /build
COPY package.json package-lock.json prisma ./

RUN npm ci --include=dev --frozen-lockfile \
 && npx prisma generate

FROM build-base AS build
COPY --chown=node:node . ./
RUN npm run build \
 && npm prune --production

FROM app-base AS dev
ENV NODE_ENV=development
# Used **only** for development and local directory should be mounted
CMD [ "npm", "run", "start:debug" ]

# Production
FROM app-base AS prod

# Install Playwright dependencies
RUN npx playwright install-deps chromium

COPY --chown=node:node --from=shared /app/ /home/node/forms-shared/
COPY --chown=node:node --from=build /build/package.json /build/package-lock.json ./
COPY --chown=node:node --from=build /build/node_modules ./node_modules
COPY --chown=node:node --from=build /build/dist ./dist
COPY --chown=node:node --from=build /build/prisma ./prisma
COPY --chown=node:node nest-cli.json ./nest-cli.json
EXPOSE 3000
ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT
LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/konto.bratislava.sk/tree/master/nest-forms-backend" \
      org.opencontainers.image.licenses="EUPL-1.2"
CMD [ "npm", "run", "start:migrate:prod" ]
