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

👀 `/e2e-tests` Automated Playwright E2E tests

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

The pipeline follows the shared Bratislava deployment conventions – see
[Deployment and releases](https://magistratba.sharepoint.com/:fl:/r/contentstorage/CSP_e7fd7f53-9abe-456a-b0e1-7cc0c63e3f1a/Document%20Library/LoopAppData/Deployment%20%26%20releases.loop?d=we29942dcbfe34648a857e7d3bfb196cf&csf=1&web=1&e=MLf6C9&nav=cz0lMkZjb250ZW50c3RvcmFnZSUyRkNTUF9lN2ZkN2Y1My05YWJlLTQ1NmEtYjBlMS03Y2MwYzYzZTNmMWEmZD1iJTIxVTNfOTU3NmFha1d3NFh6QXhqNF9Hc3RnWmNMRlhXQkR2Z2F4bHUxdEdsNGZsSnk2d2ZCeFRvWi00aXZqZ0o4ayZmPTAxWVJNMktXRzRJS002Rlk1N0pCREtRVjdIMk83M0RGV1AmYz0lMkYmYT1Mb29wQXBwJnA9JTQwZmx1aWR4JTJGbG9vcC1wYWdlLWNvbnRhaW5lciZ4PSU3QiUyMnclMjIlM0ElMjJUMFJUVUh4dFlXZHBjM1J5WVhSaVlTNXphR0Z5WlhCdmFXNTBMbU52Ylh4aUlWVXpYemsxTnpaaFlXdFhkelJZZWtGNGFqUmZSM04wWjFwalRFWllWMEpFZG1kaGVHeDFNWFJIYkRSbWJFcDVObmRtUW5oVWIxb3ROR2wyYW1kS09HdDhNREZaVWsweVMxZERRMUUyTTB4Qk5VODBOMFpHVEVVMFIwNVFTbGRLUlVoYVVRJTNEJTNEJTIyJTJDJTIyaSUyMiUzQSUyMjU1NzQyNmM4LTBmYjMtNDVhYi1iYTg1LWQ0MzZkYzMyODU1MCUyMiU3RA%3D%3D) for the overview and release rules.
Specific to this repo:

- `deploy.yml` maps the ref to a cluster and a service set with an inline resolve step,
  so tag pushes and `master` pushes are handled by one workflow.
- Build and deploy share one reusable workflow per service type (`build-nest.yml`,
  `build-next.yml`, `build-single-image.yml`); in deploy mode the nest builds skip the
  validation/test images (`skip_tests`).
- The Terragrunt units live under `clusters/<cluster>/applications/konto.bratislava.sk/<service>`
  in [infrastructure-deployment-configuration](https://github.com/bratislava/infrastructure-deployment-configuration)
  (clusters: `development`, `staging`, `production`).

### Environment variables and secrets

Non-secret env vars live in this repo, secrets live in [Passbolt](https://passbolt.bratislava.sk) –
the conventions (the `.env.deploy.*` file format, Passbolt naming and syncing, the
`read-only/` mirrors) are documented in
[Environment variables & secrets](https://magistratba.sharepoint.com/:fl:/r/contentstorage/CSP_e7fd7f53-9abe-456a-b0e1-7cc0c63e3f1a/Document%20Library/LoopAppData/Environment%20variables%20%26%20Secrets.loop?d=w77387c85f8b94b50a848ccc19d3c0972&csf=1&web=1&e=C9nE81&nav=cz0lMkZjb250ZW50c3RvcmFnZSUyRkNTUF9lN2ZkN2Y1My05YWJlLTQ1NmEtYjBlMS03Y2MwYzYzZTNmMWEmZD1iJTIxVTNfOTU3NmFha1d3NFh6QXhqNF9Hc3RnWmNMRlhXQkR2Z2F4bHUxdEdsNGZsSnk2d2ZCeFRvWi00aXZqZ0o4ayZmPTAxWVJNMktXRUZQUTRIUE9QWUtCRjJRU0dNWUdPVFlDTFMmYz0lMkYmYT1Mb29wQXBwJnA9JTQwZmx1aWR4JTJGbG9vcC1wYWdlLWNvbnRhaW5lciZ4PSU3QiUyMnclMjIlM0ElMjJUMFJUVUh4dFlXZHBjM1J5WVhSaVlTNXphR0Z5WlhCdmFXNTBMbU52Ylh4aUlWVXpYemsxTnpaaFlXdFhkelJZZWtGNGFqUmZSM04wWjFwalRFWllWMEpFZG1kaGVHeDFNWFJIYkRSbWJFcDVObmRtUW5oVWIxb3ROR2wyYW1kS09HdDhNREZaVWsweVMxZERRMUUyTTB4Qk5VODBOMFpHVEVVMFIwNVFTbGRLUlVoYVVRJTNEJTNEJTIyJTJDJTIyaSUyMiUzQSUyMmEzYTI0MjIxLTBkMmUtNGUyYi1iZWEyLTQ4OTBjZGUwYTdkYiUyMiU3RA%3D%3D). Specific to this repo:

- **Non-secret env vars** go in `<service>/.env.deploy.<cluster>`, e.g.
  `nest-forms-backend/.env.deploy.staging`, and become the `<service>-env` config map.
- **Secrets** are named `<cluster>/<service>/<ENV_VAR_NAME>` in Passbolt (e.g.
  `staging/nest-city-account/TURNSTILE_SECRET_KEY`) and sync into `<service>-secret`.
- Credentials Terraform generates for the databases, RabbitMQ and Redis are mirrored to
  Passbolt as `read-only/<cluster>/<service>/<ENV_VAR_NAME>` – look-up only.

If you don't have Passbolt access, ask around on the konto.bratislava.sk team.

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
