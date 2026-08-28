# CI-only additions to the root bake files, layered on by passing all three to
# `docker/bake-action`. Deliberately not named docker-bake.override.hcl and not
# placed in the repository root, so that bake does not pick it up locally: it
# would make plain `docker buildx bake <target>` fail without `--allow`.
#
# Everything here is a value only the runner can produce. Anything a laptop can
# also produce belongs in docker-bake.hcl instead.
#
# The registry cache and tags arrive as environment variables rather than
# `--set` overrides because the docker-metadata action emits cache_from as a
# multi-line list, and a `set:` entry carries a single value per line.

variable "CACHE_FROM" {
  default = ""
}

variable "CACHE_TO" {
  default = ""
}

variable "TAGS" {
  default = ""
}

variable "TURBO_API" {
  default = ""
}

variable "CACHE_COMPRESSION" {
  # Cache blobs are only ever read back by BuildKit, never pulled by a container
  # runtime, so the compression format is a free choice. zstd at a low level is
  # markedly faster than the gzip default, which is what the export spends its
  # time on: it compresses on a single core in the runner's dind sidecar.
  #
  # force-compression is deliberately not set, so layers that arrive already
  # compressed (base images from Docker Hub) are passed through instead of being
  # re-encoded for no benefit. Existing gzip cache blobs therefore stay gzip
  # until they are next rebuilt, so the speedup ramps in rather than landing at
  # once.
  #
  # image-manifest/oci-mediatypes make the cache a real OCI image manifest
  # rather than the legacy cache-manifest form, which is what lets Harbor apply
  # retention policies to the `cache-*` tags.
  default = "compression=zstd,compression-level=1,image-manifest=true,oci-mediatypes=true"
}

target "_toolchain" {
  cache-from = compact(split("\n", CACHE_FROM))
  # Compression is a per-export CSV parameter, so it is appended to each ref
  # rather than set on its own. compact() runs first, so an empty CACHE_TO stays
  # an empty list instead of becoming a bare parameter string.
  cache-to = [
    for ref in compact(split("\n", CACHE_TO)) : "${ref},${CACHE_COMPRESSION}"
  ]
  # docker-metadata emits tags space-separated; tolerate newlines too.
  tags = compact(split(" ", replace(TAGS, "\n", " ")))
}

# Redeclaring the target merges into the one in docker-bake.hcl, so every image
# that inherits it picks up the remote cache without the root file mentioning CI.
#
# network=host puts the build steps in the builder's network namespace, which
# the workflows put in the runner's namespace via the `network=host` buildx
# driver option. That is what makes the localhost TURBO_API resolve, and it
# needs `allow: network.host` on the bake action.
target "_turbo-cache" {
  network = "host"
  args = {
    TURBO_API   = TURBO_API
    TURBO_TEAM  = "city-account"
    TURBO_TOKEN = "local"
  }
}
