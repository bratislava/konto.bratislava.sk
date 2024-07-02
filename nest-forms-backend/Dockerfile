ARG FORMS_SHARED_TAG=latest
FROM harbor.bratislava.sk/standalone/forms-shared:${FORMS_SHARED_TAG} as shared
FROM node:20.9 AS base

# Based on https://github.com/puppeteer/puppeteer/blob/main/docker/Dockerfile
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome-stable

# build
FROM base AS build
WORKDIR /root/forms-shared
COPY --from=shared . ./

RUN apt-get update && apt-get install git

WORKDIR /root/nest-forms-backend
COPY package*.json ./

RUN npm ci

COPY . ./

RUN npx prisma generate --schema=./prisma/schema.prisma

RUN npx prisma migrate

RUN npm run build

# development
FROM base AS dev

RUN apt-get update && apt-get install -y git \
    postgresql-client \
    curl \
    vim

WORKDIR /home/node/nest-forms-backend
COPY package*.json ./

RUN npm install
COPY . ./

RUN npx prisma generate

CMD [ "npm", "run", "start:debug" ]


# production
FROM base AS prod

USER node

# When copying from build, it copies symlink in node_modules to ../../forms-shared and expects the original directory
# to be present.
# TODO: Find a way how to use --install-links flag in npm install to avoid this.
RUN mkdir -p /home/node/forms-shared && chown -R node:node /home/node/forms-shared
WORKDIR /home/node/forms-shared
COPY --chown=node:node --from=shared . ./

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node --from=build /root/nest-forms-backend/package*.json ./
COPY --chown=node:node --from=build /root/nest-forms-backend/node_modules ./node_modules
RUN npm prune --production

COPY --chown=node:node --from=build /root/nest-forms-backend/dist ./dist
COPY --chown=node:node --from=build /root/nest-forms-backend/res ./res
COPY --chown=node:node --from=build /root/nest-forms-backend/prisma ./prisma
COPY --chown=node:node nest-cli.json ./nest-cli.json

ENTRYPOINT npx prisma migrate deploy && npm run start:prod
