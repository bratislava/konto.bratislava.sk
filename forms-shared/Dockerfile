FROM node:20.9-alpine AS base

RUN apk add --no-cache tzdata
ENV TZ=Europe/Bratislava

# Install dependencies required for building node-canvas from source
RUN apk add --no-cache make gcc g++ python3 pkgconfig pixman-dev cairo-dev pango-dev libjpeg-turbo-dev

# Install dependencies required for Playwright and Chromium
RUN apk add --no-cache \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    chromium

# Inform Playwright to skip browser downloads as we're using the system-provided Chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Set CHROME_BIN and CHROME_PATH environment variables to point to the Chromium binary
# Note: The path might vary depending on the installed package and the Alpine version.
# The typical path for Chromium in Alpine Linux is /usr/bin/chromium-browser, but you should verify this for your specific setup.
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package.json ./

FROM base as prod
ENV YARN_CACHE_FOLDER=/build/.cache/yarn

# Install dependencies, including development dependencies needed for building native modules
RUN yarn config set network-timeout 600000 -g \
 && yarn install --frozen-lockfile

FROM prod as test
COPY . .

# Ensure all native modules are built correctly
#RUN #yarn rebuild

# In your test scripts, ensure to use the system-provided Chromium by specifying the executable path
# For example, in your Playwright config or test scripts:
# playwright.chromium.launch({ executablePath: process.env.CHROME_BIN })

CMD ["yarn", "test"]
