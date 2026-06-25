# konto.bratislava.sk

Monorepo of services, shared libraries and frontend for [konto.bratislava.sk](https://konto.bratislava.sk).

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

### Validation and build pipelines

By creating a PR, GitHub actions will run validation pipelines and Dockerized build, lint and test pipelines.

## Acknowledgments

This project utilizes the [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) library, which is an open-source project developed by [David J. Bradshaw](https://github.com/davidjbradshaw). We are grateful for the work that has been put into this library and its contribution to the open-source community.
