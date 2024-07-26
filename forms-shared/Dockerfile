FROM node:20.9-slim AS base

# Install dependencies needed for "pdf-to-img" which uses "node-canvas"
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
COPY package.json package-lock.json ./
RUN npm ci --include=dev --frozen-lockfile


FROM base as prod
COPY . ./
RUN npm run build

FROM base as test
ENV DOCKER_TEST_ENVIRONMENT=true

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

ENV FOP_HOME=/opt/fop-1.1

# Download and setup fop.zip from slovensko.sk
RUN wget https://www.slovensko.sk/_img/CMS4/fop.zip \
    && unzip fop.zip -d /opt/slovensko-fop \
    && rm fop.zip

ENV SLOVENSKO_FOP_CONF=/opt/slovensko-fop/fop.xconf

# Install Saxon
RUN wget https://github.com/Saxonica/Saxon-HE/raw/main/12/Java/SaxonHE12-5J.zip \
    && unzip SaxonHE12-5J.zip -d /opt/saxon \
    && rm SaxonHE12-5J.zip

ENV SAXON_HOME=/opt/saxon

RUN npx playwright install chromium --with-deps
# COPY needs to be after Playwright installation to make it more cache friendly.
COPY . ./
CMD [ "npm", "run", "test" ]
