FROM node:20.9-slim AS base

# Install dependencies needed for "pdf-to-img" which uses "node-canvas"
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

FROM base as app-base
COPY . ./

FROM app-base as prod
RUN npm run build

FROM app-base as test
RUN npx playwright install chromium --with-deps
CMD [ "npm", "run", "test" ]
