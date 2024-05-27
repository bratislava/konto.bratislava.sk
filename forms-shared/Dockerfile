FROM node:20.9-alpine AS base
COPY . ./

FROM base as prod
ENV YARN_CACHE_FOLDER=/build/.cache/yarn
RUN --mount=type=cache,target=/build/.cache/yarn \
    yarn config set network-timeout 600000 -g \
 && yarn install --production --frozen-lockfile