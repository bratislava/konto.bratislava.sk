# syntax=docker/dockerfile:1.7

# Adapted from pnpm's own image, which installs the binary the same way:
# https://github.com/pnpm/pnpm/blob/main/docker/Dockerfile
#
# pnpm publishes two Linux builds:
#
#   Build   Runs on Debian   Runs on Alpine   Used by
#   glibc   yes              no               pnpm's own Dockerfile (Debian)
#   musl    yes              yes              this file, for all our images
#
# The musl build is made for Alpine, but it also runs on Debian because it
# brings everything it needs with it. All our images are Alpine except the
# forms-shared test image (forms-shared/Dockerfile.test), which is Debian
# because Playwright's Chromium does not support Alpine. Thanks to musl, both
# can use the same download. The glibc build does not run on Alpine; it fails
# there with a confusing "not found".
#
# The node image is used only to avoid pinning another base image; Node.js
# itself is not needed here. curl is installed because busybox wget cannot
# retry failed downloads.

ARG NODE_VERSION
FROM node:${NODE_VERSION}-alpine AS pnpm-dist

ARG PNPM_VERSION
# Supplied by BuildKit. Declared here, after FROM, or it arrives empty.
ARG TARGETARCH

# The version is read back from the binary before this layer is allowed to
# succeed, so a truncated download or a libc mismatch fails here instead of
# somewhere deep in a service build.
RUN set -eu; \
    test -n "$PNPM_VERSION"; \
    apk add --no-cache curl; \
    case "$TARGETARCH" in \
      amd64) arch=x64 ;; \
      arm64) arch=arm64 ;; \
      *) echo "unsupported architecture: $TARGETARCH" >&2; exit 1 ;; \
    esac; \
    mkdir -p /opt/pnpm; \
    curl -fsSL --retry 3 --retry-delay 2 -o /tmp/pnpm.tgz \
      "https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linux-${arch}-musl.tar.gz"; \
    tar -xzf /tmp/pnpm.tgz -C /opt/pnpm; \
    rm /tmp/pnpm.tgz; \
    installed="$(/opt/pnpm/pnpm --version)"; \
    test "$installed" = "$PNPM_VERSION" || { \
      echo "pnpm version mismatch: expected $PNPM_VERSION, got $installed" >&2; \
      exit 1; \
    }
