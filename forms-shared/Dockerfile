FROM node:22.21-slim AS base

# Install build tools and Python needed for native npm dependencies (e.g., deasync)
# Note: pdf-to-img v5.0.0+ no longer uses node-canvas, but we keep build tools for other deps, as canvas is still a peer dependency of for example jsdom.
# https://github.com/Automattic/node-canvas/wiki/Installation%3A-Ubuntu-and-other-Debian-based-systems
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS prod

COPY package.json package-lock.json ./
RUN npm ci --include=dev --frozen-lockfile
COPY . ./
RUN npm run build

ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT
LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/konto.bratislava.sk/tree/master/forms-shared" \
      org.opencontainers.image.licenses="EUPL-1.2"

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

# Download the Slovensko.sk metadata file
RUN mkdir -p /opt/slovensko-metadata
RUN wget -O /opt/slovensko-metadata/mef.json https://www.slovensko.sk/static/eForm/datasetexport/json/mef.json
ENV SLOVENSKO_SK_METADATA_PATH=/opt/slovensko-metadata/mef.json

# Install dependencies and Playwright
COPY package.json package-lock.json ./
RUN npm ci --include=dev --frozen-lockfile
RUN npx playwright install chromium --with-deps
COPY . ./

FROM test-base AS test
CMD [ "npm", "run", "test:ci" ]

FROM test-base AS test-update
CMD [ "npm", "run", "test:ci:update" ]
