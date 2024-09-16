# id forms-shared tag is not specified, use general "latest"
ARG FORMS_SHARED_TAG=6869d7843b1710ea921281de07182ddbd977c37e
FROM harbor.bratislava.sk/standalone/forms-shared:${FORMS_SHARED_TAG} as shared
# alpine has limitations with installing playwright
FROM node:20.10 AS base
ENV NODE_ENV=production

RUN npx playwright install-deps chromium

# used as app-base in prodution and development image
FROM base AS app-base
RUN apt-get update \
 && apt-get install -y tini \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /home/node/app \
 && chown -R node:node /home/node/app
USER node
WORKDIR /home/node/app
ENTRYPOINT [ "/sbin/tini", "--" ]

FROM base AS build-base
# make forms shared available
WORKDIR /forms-shared
COPY --from=shared /app/ ./
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
# used **only** for development and local directory should be mounted
CMD [ "npm", "run", "start:debug" ]

# production
FROM app-base AS prod

COPY --chown=node:node --from=build /build/package.json /build/package-lock.json ./
COPY --chown=node:node --from=build /build/node_modules ./node_modules
COPY --chown=node:node --from=build /build/dist ./dist
COPY --chown=node:node --from=build /build/prisma ./prisma
COPY --chown=node:node nest-cli.json ./nest-cli.json
EXPOSE 3000
ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT
LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/nest-prisma-template" \
      org.opencontainers.image.licenses="EUPL-1.2"
CMD [ "npm", "run", "start:migrate:prod" ]
