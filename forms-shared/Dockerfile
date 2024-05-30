FROM node:20.9-alpine AS base
# Needed for pdf-to-img
# https://github.com/node-gfx/node-canvas-prebuilt/issues/77#issuecomment-1975794256
RUN apk add --no-cache make gcc g++ python3 pkgconfig pixman-dev cairo-dev pango-dev libjpeg-turbo-dev
COPY . ./

FROM base as prod
ENV YARN_CACHE_FOLDER=/build/.cache/yarn
RUN --mount=type=cache,target=/build/.cache/yarn \
    yarn config set network-timeout 600000 -g \
 && yarn install --development --frozen-lockfile
