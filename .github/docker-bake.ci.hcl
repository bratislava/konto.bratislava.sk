# CI-only additions to the root bake files, layered on by passing all three to
# `docker/bake-action`. Deliberately not named docker-bake.override.hcl and not
# placed in the repository root, so that bake does not pick it up locally: it
# would make plain `docker buildx bake <target>` fail without `--allow`.
#
# Everything here is a value only the runner can produce. Anything a laptop can
# also produce belongs in docker-bake.hcl instead.
#
# The registry cache, tags and image exporter arrive as environment variables
# rather than `--set` overrides because the docker-build-config action emits
# cache_from as a multi-line list, and a `set:` entry carries a single value
# per line.

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

variable "OUTPUT" {
  default = ""
}

target "_toolchain" {
  cache-from = compact(split("\n", CACHE_FROM))
  cache-to   = compact(split("\n", CACHE_TO))
  # docker-build-config emits tags space-separated; tolerate newlines too.
  tags   = compact(split(" ", replace(TAGS, "\n", " ")))
  output = compact(split("\n", OUTPUT))
}

# Redeclaring the target merges into the one in docker-bake.hcl, so every image
# that inherits it picks up the remote cache without the root file mentioning CI.
#
# network=host puts the build steps in the builder's network namespace, which
# the workflows put in Docker's host network via the `network=host` buildx
# driver option. That is what makes localhost addresses resolve: the E2E
# database service container, and the in-job cache server the E2E tests
# workflow starts on GitHub-hosted runners. It needs `allow: network.host` on
# the bake action. On the self-hosted runners TURBO_API is the shared cache
# server's cluster address instead.
#
# The cache token is a BuildKit secret rather than a build arg, so it stays out
# of the layer metadata that the registry cache exports. The Dockerfiles mount
# it as TURBO_TOKEN on each `turbo run` step.
target "_turbo-cache" {
  network = "host"
  args = {
    TURBO_API  = TURBO_API
    TURBO_TEAM = "city-account"
  }
  secret = ["id=turbo_token,env=TURBO_TOKEN"]
}
