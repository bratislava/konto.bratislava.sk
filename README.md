# konto.bratislava.sk

Monorepo of services, shared libraries and frontend for [konto.bratislava.sk](https://konto.bratislava.sk).

## Toolchain

**pnpm is the only supported package manager — do not use npm or yarn.**

pnpm must be installed via the [official guide](https://pnpm.io/installation), not through npm, to work correctly.

pnpm resolves this workspace reliably where npm does not: npm installs without complaint but then breaks at build time with obscure module resolution errors on the more complex dependency graphs here, also its flat `node_modules` hides phantom dependencies — packages that are importable without ever being declared.

Node and pnpm versions are pinned once in the root `package.json`. How they are provisioned depends on how you invoke the runtime:

- **`node` directly** — [Volta](https://volta.sh) provides the version in `volta.node`. (Volta doesn't support pnpm 12+.)
- **`pnpm`, and `node` reached through pnpm** — the versions are managed by pnpm. `devEngines` pins both, and `pmOnFail: download` / `runtimeOnFail: download` in `pnpm-workspace.yaml` tell pnpm to fetch a pinned version that is not present rather than fail. So `pnpm install` on a fresh checkout provisions its own pnpm and Node.

The `onFail: error` on `devEngines` is the strict default for everything else — a tool that reads the pin but does not satisfy the version stops rather than run on a mismatch.

## Turborepo

[Turborepo](https://turbo.build) is configured once in the root `turbo.json`.

- Every task depends on `^build`, so shared packages are always built before whatever consumes them — you never have to rebuild dependencies by hand.
- Apps that consume those packages have a `build:dependencies` script, which builds everything the package depends on but not the package itself. Use it to get a freshly cloned workspace ready for `pnpm run dev` without building the app first.
- Task results are cached and replayed instead of re-run when nothing relevant changed. Locally that is a `.turbo` directory; in CI it is a shared remote cache, so a package unchanged since an earlier run is restored rather than rebuilt.
- We do not currently run several services at once (there is no `dev` task, and a CI build targets a single service), so the parallel-task side of Turborepo buys us little today. The caching and the dependency ordering are the reasons it is here.

## Product specification

[Product specification for city account (internal)](https://magistratba.sharepoint.com/:w:/s/InnovationTeam/Ee7urGwpSLBGnhyBYT5OJyAB9yPAd8xctA2I_xU6rYWbuA?e=ofobAR)

## What's here

Each sub-project contains a README which should get you up and running. More documentation can be (eventually) found [here](https://bratislava.github.io)

⚙️️ `/clamav` Instance of clamav https://www.clamav.net

⚙️️ `/cvdmirror` Local mirror of cvd database used for clamav scanner

📟 `/forms-shared` Shared components and utils for frontend and backend

🗄️ `/nest-city-account` Service which is handling user related logic for konto

🗄️ `/nest-clamav-scanner` This service is responsible for handling files which were sent to the clamav scanner.

🗄️ `/nest-forms-backend` Service which is handling incoming and outgoing forms created by users

🗄️ `/nest-tax-backend` This service is responsible for digital tax payment.

🏡 `/next` Next.js web app

🗄️ `/strapi` Strapi CMS server

👀 `/tests/cypress` Automated cypress tests

📦 `/openapi-clients` Auto-generated OpenAPI TypeScript clients

## Deployment

### Full Project Deployment

Deploy all services by creating a tag in format: `<environment><version>`

> [!NOTE]
> Backend services deploy first, followed by frontend.

- Examples: `dev1.0.0`, `staging1.0.0`, `prod1.0.0`

### Single Service Deployment

Deploy specific service by creating a tag in format: `<environment>-<service-name><version>`

- Examples: `dev-next1.0.0`, `staging-nest-forms-backend1.0.0`

> [!NOTE]
> Pushing to `master` deploys the whole project to staging.

### How deploys work

Build and deploy share one reusable workflow per service type (`build-nest.yml`, `build-next.yml`, `build-single-image.yml`). On a PR these run in build-only mode; in `deploy.yml` they run in deploy mode (`cluster` set), which builds the service image (if an image for the current commit does not already exist in Harbor) and tags it as `<cluster>-<short-sha>`. In deploy mode the nest builds also skip the validation/test images (`skip_tests`). Once a service image is built, a matching `deploy-*` job in `deploy.yml` calls the shared `trigger-infra-deploy.yml` workflow, which dispatches `deploy.yml` in [infrastructure-deployment-configuration](https://github.com/bratislava/infrastructure-deployment-configuration); that applies the Terragrunt module for the service (under `clusters/<cluster>/applications/konto.bratislava.sk/<service>`) on the target cluster.

Backend images are environment-agnostic, so a single per-commit build is reused across clusters. The Next.js frontend bakes its environment into the build, so it is rebuilt (with a separate Docker cache and an `-<env>` tag suffix) for every cluster.

The build and deploy plumbing (Buildx setup, registry logins, Docker tag/cache metadata, image reuse checks, and the infrastructure deploy trigger) comes from shared actions in [bratislava/github-actions](https://github.com/bratislava/github-actions).

### Environment variables and secrets

Runtime configuration is split in two: **non-secret env vars live in this repo**, next to the code they configure, and **secrets live in Passbolt**. The deployment itself is still defined per cluster in [infrastructure-deployment-configuration](https://github.com/bratislava/infrastructure-deployment-configuration), under `clusters/<cluster>/applications/konto.bratislava.sk/<service>` (clusters: `development`, `staging`, `production`).

**Non-secret env vars** go in `<service>/.env.deploy.<cluster>`, e.g. `nest-forms-backend/.env.deploy.staging`. On deploy the infrastructure repo reads that file from the exact commit being deployed and turns it into the `<service>-env` config map. The format is: one `KEY=VALUE` per line, blank lines and whole-line `#` comments ignored, and one surrounding pair of either `'` or `"` stripped if present (the two ends have to match; a lone quote on one side is kept as part of the value). **A value has to fit on a single line** — there is no line continuation and no escape processing, so a `#` mid-line stays part of the value. Anything multiline (a PEM key, a certificate) must either be rewritten to a single line, or land in Passbolt.

**Secrets** live in [Passbolt](https://www.passbolt.com/) and are synced into the cluster by External Secrets Operator, so you need Passbolt access to change them. Every secret belongs to exactly one service: Passbolt resources are named `<cluster>/<service>/<ENV_VAR_NAME>` (e.g. `staging/nest-city-account/TURNSTILE_SECRET_KEY`) and sync into that service's `<service>-secret` Kubernetes Secret. There are no shared secret groups — a value that two services both need is stored once per service.

Updating the value in Passbolt is enough — it syncs to the cluster automatically with next deploy. Same goes for **new** secret env vars, as long as they are named under an existing service. If needed, it's also possible to sync secrets without full redeployment, only with (rolling - no production downtime) application restart (ask the infra repo maintainers).

A few entries go the other way: credentials Terraform generates for the databases, RabbitMQ and Redis are published *into* Passbolt as `read-only/<cluster>/<service>/<ENV_VAR_NAME>`. Those are a read-only mirror so the team can look the values up — the `read-only/` prefix is what stops External Secrets from syncing them back, and editing them in Passbolt does nothing, as the next apply reverts it.

If you don't have Passbolt access, ask around on the konto.bratislava.sk team.

If you aren't sure where a variable belongs, or need help with anything else deployment-config wise, ask the maintainers of the infrastructure repo.

### Validation and build pipelines

By creating a PR, GitHub actions will run validation pipelines and Dockerized build, lint and test pipelines.

## Docker

A few things here differ from a typical per-service Docker setup:

- The build context is always the repository root, never the service directory — `turbo prune --docker` needs the workspace metadata to resolve the dependency graph. Hence a single root `.dockerignore`, and `prepare` stages that prune before installing.
- Bake reads three files, merging targets of the same name:
  - `docker-bake.hcl` — targets, and everything a laptop can do. `docker buildx bake <target>` works with no arguments.
  - `docker-bake.json` — toolchain versions only. Plain JSON so [scripts/verify-docker-bake-versions.ts](scripts/verify-docker-bake-versions.ts) can check them against `package.json` and the pnpm catalog without parsing HCL.
  - `.github/docker-bake.ci.hcl` — CI-only overlay (registry cache, tags, host networking, remote cache). Kept out of the root and off the `docker-bake.override.hcl` name so local bake does not pick it up and fail on the missing `--allow`.
- pnpm is installed from [pnpm.Dockerfile](pnpm.Dockerfile), which every image `COPY`s from through the `pnpm-dist` bake context.
- Two Dockerfile checks are skipped for every image, via a `BUILDKIT_DOCKERFILE_CHECK` build arg on the shared bake target instead of a `# check=skip=` directive in each Dockerfile. `docker-bake.hcl` says which and why.
- CI runs the Turborepo cache server on the runner's loopback, so builds reach it at `127.0.0.1` — no published port, no proxy, no `host.docker.internal` (a Docker Desktop convenience that does not exist on Linux runners). Three pieces have to line up for that: the `network=host` buildx driver option, `network = "host"` on the bake target, and `allow: network.host` on each bake step to grant the gated entitlement. Missing any one of them yields a silent cache miss, not an error.
- Tests and lint run inside `docker build` as their own stages, not as runner steps, so an unchanged service short-circuits on the layer cache instead of re-running them.
- CI bake steps pass `source: .` to build from the checkout. Without it BuildKit clones the repository — following every tag — inside the builder (it takes around 30 seconds extra for no gain).
- Next.js images bake their environment in, so they are built per cluster. Backend images are environment-agnostic and built once per commit.

## Acknowledgments

This project utilizes the [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) library, which is an open-source project developed by [David J. Bradshaw](https://github.com/davidjbradshaw). We are grateful for the work that has been put into this library and its contribution to the open-source community.
