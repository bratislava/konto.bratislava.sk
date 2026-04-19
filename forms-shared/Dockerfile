# syntax=docker.io/docker/dockerfile:1.7-labs
# Using newer syntax adds `COPY --exclude` support
FROM node:24.14-slim AS base

WORKDIR /app

FROM base AS test-base
# Install Java and other dependencies
RUN apt-get update && apt-get install -y \
    default-jre \
    wget \
    unzip \
    libxml2 \
    libxslt1.1 \
    && rm -rf /var/lib/apt/lists/*

# Install Apache FOP 1.1
RUN wget https://archive.apache.org/dist/xmlgraphics/fop/binaries/fop-1.1-bin.zip \
    && unzip fop-1.1-bin.zip \
    && mv fop-1.1 /opt/fop-1.1 \
    && rm fop-1.1-bin.zip

ENV FOP_JAR=/opt/fop-1.1/build/fop.jar
ENV FOP_LIB=/opt/fop-1.1/lib

# Install Saxon
RUN wget https://github.com/Saxonica/Saxon-HE/raw/main/12/Java/SaxonHE12-5J.zip \
    && unzip SaxonHE12-5J.zip -d /opt/saxon \
    && rm SaxonHE12-5J.zip

ENV SAXON_JAR=/opt/saxon/saxon-he-12.5.jar

# Download and setup fop.zip from slovensko.sk
RUN wget https://www.slovensko.sk/_img/CMS4/fop.zip \
    && unzip fop.zip -d /opt/slovensko-fop \
    && rm fop.zip

ENV SLOVENSKO_FOP_CONF=/opt/slovensko-fop/fop.xconf

# Install Playwright browsers before package files are copied so this layer only
# changes when the locked Playwright package version changes. Chromium and its
# system dependencies are large, so keeping them in a reusable cached layer
# avoids pulling them again after ordinary package or source changes.
ARG PLAYWRIGHT_VERSION
RUN test -n "${PLAYWRIGHT_VERSION}" \
    && npx --yes "playwright@${PLAYWRIGHT_VERSION}" install chromium --with-deps

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . ./

# Download the Slovensko.sk metadata file
# This file changes once a day, without providing the env variable it would get cached by Docker.
ARG SLOVENSKO_MEF_JSON_LAST_MODIFIED
RUN mkdir -p /opt/slovensko-metadata \
    && test -n "${SLOVENSKO_MEF_JSON_LAST_MODIFIED}" \
    && echo "slovensko_mef_json_last_modified=${SLOVENSKO_MEF_JSON_LAST_MODIFIED}" \
    && wget -O /opt/slovensko-metadata/mef.json https://www.slovensko.sk/static/eForm/datasetexport/json/mef.json
ENV SLOVENSKO_SK_METADATA_PATH=/opt/slovensko-metadata/mef.json

FROM test-base AS test
CMD [ "npm", "run", "test:ci" ]

FROM test-base AS test-update
CMD [ "npm", "run", "test:ci:update" ]

FROM base AS prod-build

COPY package.json package-lock.json ./
RUN npm ci --include=dev
# Test folders are excluded because they contain large image snapshots
COPY --exclude=tests --exclude=test-utils . ./
RUN npm run build

FROM scratch AS prod

COPY --from=prod-build /app/package.json ./package.json
COPY --from=prod-build /app/package-lock.json ./package-lock.json
COPY --from=prod-build /app/dist ./dist
