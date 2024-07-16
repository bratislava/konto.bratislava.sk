FROM node:20.9-alpine AS base
# Needed for "pdf-to-img" which uses "node-canvas"
# https://github.com/node-gfx/node-canvas-prebuilt/issues/77#issuecomment-1975794256
RUN apk add --no-cache make gcc g++ python3 pkgconfig pixman-dev cairo-dev pango-dev libjpeg-turbo-dev
COPY . ./

FROM base as prod
RUN npm ci --include=dev --frozen-lockfile
RUN npm run build

FROM prod as test
CMD [ "npm", "run", "test" ]
