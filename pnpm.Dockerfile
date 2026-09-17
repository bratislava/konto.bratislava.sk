# syntax=docker/dockerfile:1.7

# Adapted from pnpm's own image, which installs the binary the same way:
# https://github.com/pnpm/pnpm/blob/main/docker/Dockerfile
#
# Two Linux builds are published, one linked against glibc and one against musl.
# The musl one is statically linked -- it carries its own libc instead of loading
# the system's -- so it runs unchanged whatever base image COPYs it, glibc or
# musl. Using it everywhere is what keeps this a single download with no
# per-image libc branch. The glibc build is the opposite: it needs a dynamic
# loader the musl distributions do not have, and fails there with a bare
# "not found".
#
# Built on the same node image as everything else purely so there is no extra
# base image to pin and refresh -- nothing here uses Node.js. curl is installed
# for its --retry, which busybox wget has no equivalent for, and a registry
# hiccup should not fail a build.

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
