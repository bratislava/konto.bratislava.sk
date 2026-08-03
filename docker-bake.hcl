# Docker build definitions for every image built from the repository root
# context, which `turbo prune --docker` needs so it can see the workspace
# metadata.
#
# The toolchain versions live in docker-bake.json rather than here. That file is
# plain JSON, so `scripts/verify-docker-bake-versions.ts` can check it against
# the root package.json and the pnpm catalog without parsing HCL. Bake reads
# both files automatically, so there is nothing to pass on the command line.
#
# This file holds only what a build needs to run on a laptop:
#
#   docker buildx bake next
#
# Registry cache, tags, pushing, host networking and the Turborepo remote cache
# are CI concerns and are layered on top by the workflows -- see
# .github/docker-bake.ci.hcl.

variable "NEXT_BUILD_ENV" {
  # Which next/.env.ci-build.<env> is baked into the Next.js image. Deploys
  # override this per cluster; staging is the sensible local default.
  default = "staging"

  validation {
    condition     = contains(["dev", "staging", "prod"], NEXT_BUILD_ENV)
    error_message = "NEXT_BUILD_ENV must be one of dev, staging, prod."
  }
}

target "_toolchain" {
  context = "."
  args = {
    NODE_VERSION  = NODE_VERSION
    PNPM_VERSION  = PNPM_VERSION
    TURBO_VERSION = TURBO_VERSION
  }
}

# The images whose build runs `turbo run`, and so can use the Turborepo remote
# cache. Empty on purpose: the cache only exists on the CI runner, and the
# overlay in .github/ redeclares this target to add it. Bake merges targets of
# the same name across files, so everything below inherits the CI settings
# without any of them naming a CI concept.
target "_turbo-cache" {
  inherits = ["_toolchain"]
}

# --- forms-shared -------------------------------------------------------------
# Tests only; there is no deployable forms-shared image. Does not use the
# Turborepo remote cache, so it inherits the plain toolchain target.

target "forms-shared-test" {
  inherits   = ["_toolchain"]
  dockerfile = "forms-shared/Dockerfile.test"
  target     = "test"
  args = {
    PLAYWRIGHT_VERSION = PLAYWRIGHT_VERSION
  }
}

# Run by `pnpm --filter forms-shared docker:test`. Tagged because, unlike the
# `test` target above, the image is started with `docker run` afterwards.
target "forms-shared-test-local" {
  inherits = ["forms-shared-test"]
  target   = "test-local"
  tags     = ["forms-shared-docker-runner:test-local"]
}

target "forms-shared-test-local-update" {
  inherits = ["forms-shared-test"]
  target   = "test-local-update"
  tags     = ["forms-shared-docker-runner:test-local-update"]
}

# --- next ---------------------------------------------------------------------

target "next" {
  inherits   = ["_turbo-cache"]
  dockerfile = "next/Dockerfile"
  target     = "runner"
  args = {
    NEXT_BUILD_ENV = NEXT_BUILD_ENV
  }
}

# --- strapi -------------------------------------------------------------------

target "strapi" {
  inherits   = ["_turbo-cache"]
  dockerfile = "strapi/Dockerfile"
  target     = "runner"
}

# --- nest services ------------------------------------------------------------
# Every service exposes the same stages, so each one gets a private base target
# naming its Dockerfile and one target per stage. The stage target names are
# what the build-nest workflow passes to bake, as `<service>[-<stage>]`.

target "_nest-city-account" {
  inherits   = ["_turbo-cache"]
  dockerfile = "nest-city-account/Dockerfile"
}

target "nest-city-account" {
  inherits = ["_nest-city-account"]
  target   = "runner"
}

target "nest-city-account-builder-deps" {
  inherits = ["_nest-city-account"]
  target   = "builder-deps"
}

target "nest-city-account-test" {
  inherits = ["_nest-city-account"]
  target   = "test"
}

target "nest-city-account-lint" {
  inherits = ["_nest-city-account"]
  target   = "lint"
}

target "_nest-clamav-scanner" {
  inherits   = ["_turbo-cache"]
  dockerfile = "nest-clamav-scanner/Dockerfile"
}

target "nest-clamav-scanner" {
  inherits = ["_nest-clamav-scanner"]
  target   = "runner"
}

target "nest-clamav-scanner-builder-deps" {
  inherits = ["_nest-clamav-scanner"]
  target   = "builder-deps"
}

target "nest-clamav-scanner-test" {
  inherits = ["_nest-clamav-scanner"]
  target   = "test"
}

target "nest-clamav-scanner-lint" {
  inherits = ["_nest-clamav-scanner"]
  target   = "lint"
}

target "_nest-forms-backend" {
  inherits   = ["_turbo-cache"]
  dockerfile = "nest-forms-backend/Dockerfile"
}

target "nest-forms-backend" {
  inherits = ["_nest-forms-backend"]
  target   = "runner"
}

target "nest-forms-backend-builder-deps" {
  inherits = ["_nest-forms-backend"]
  target   = "builder-deps"
}

target "nest-forms-backend-test" {
  inherits = ["_nest-forms-backend"]
  target   = "test"
}

target "nest-forms-backend-lint" {
  inherits = ["_nest-forms-backend"]
  target   = "lint"
}

# The only service with E2E tests. CI_E2E_DATABASE_URL points at a database that
# only exists on the runner, so the workflow passes it as a build arg override.
target "nest-forms-backend-test-e2e" {
  inherits = ["_nest-forms-backend"]
  target   = "test-e2e"
}

target "_nest-tax-backend" {
  inherits   = ["_turbo-cache"]
  dockerfile = "nest-tax-backend/Dockerfile"
}

target "nest-tax-backend" {
  inherits = ["_nest-tax-backend"]
  target   = "runner"
}

target "nest-tax-backend-builder-deps" {
  inherits = ["_nest-tax-backend"]
  target   = "builder-deps"
}

target "nest-tax-backend-test" {
  inherits = ["_nest-tax-backend"]
  target   = "test"
}

target "nest-tax-backend-lint" {
  inherits = ["_nest-tax-backend"]
  target   = "lint"
}

# Bare `docker buildx bake` builds every deployable image.
group "default" {
  targets = [
    "next",
    "strapi",
    "nest-city-account",
    "nest-clamav-scanner",
    "nest-forms-backend",
    "nest-tax-backend",
  ]
}
