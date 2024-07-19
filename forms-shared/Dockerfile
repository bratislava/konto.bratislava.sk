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
RUN npx playwright install chromium --with-deps
# COPY needs to be after Playwright installation to make it more cache friendly.
COPY . ./
CMD [ "npm", "run", "test" ]
