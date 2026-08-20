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

The pipeline follows the shared Bratislava deployment conventions — see
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

Non-secret env vars live in this repo, secrets live in [Passbolt](https://passbolt.bratislava.sk) —
the conventions (the `.env.deploy.*` file format, Passbolt naming and syncing, the
`read-only/` mirrors) are documented in
[Environment variables & secrets](https://magistratba.sharepoint.com/:fl:/r/contentstorage/CSP_e7fd7f53-9abe-456a-b0e1-7cc0c63e3f1a/Document%20Library/LoopAppData/Environment%20variables%20%26%20Secrets.loop?d=w77387c85f8b94b50a848ccc19d3c0972&csf=1&web=1&e=C9nE81&nav=cz0lMkZjb250ZW50c3RvcmFnZSUyRkNTUF9lN2ZkN2Y1My05YWJlLTQ1NmEtYjBlMS03Y2MwYzYzZTNmMWEmZD1iJTIxVTNfOTU3NmFha1d3NFh6QXhqNF9Hc3RnWmNMRlhXQkR2Z2F4bHUxdEdsNGZsSnk2d2ZCeFRvWi00aXZqZ0o4ayZmPTAxWVJNMktXRUZQUTRIUE9QWUtCRjJRU0dNWUdPVFlDTFMmYz0lMkYmYT1Mb29wQXBwJnA9JTQwZmx1aWR4JTJGbG9vcC1wYWdlLWNvbnRhaW5lciZ4PSU3QiUyMnclMjIlM0ElMjJUMFJUVUh4dFlXZHBjM1J5WVhSaVlTNXphR0Z5WlhCdmFXNTBMbU52Ylh4aUlWVXpYemsxTnpaaFlXdFhkelJZZWtGNGFqUmZSM04wWjFwalRFWllWMEpFZG1kaGVHeDFNWFJIYkRSbWJFcDVObmRtUW5oVWIxb3ROR2wyYW1kS09HdDhNREZaVWsweVMxZERRMUUyTTB4Qk5VODBOMFpHVEVVMFIwNVFTbGRLUlVoYVVRJTNEJTNEJTIyJTJDJTIyaSUyMiUzQSUyMmEzYTI0MjIxLTBkMmUtNGUyYi1iZWEyLTQ4OTBjZGUwYTdkYiUyMiU3RA%3D%3D). Specific to this repo:

- **Non-secret env vars** go in `<service>/.env.deploy.<cluster>`, e.g.
  `nest-forms-backend/.env.deploy.staging`, and become the `<service>-env` config map.
- **Secrets** are named `<cluster>/<service>/<ENV_VAR_NAME>` in Passbolt (e.g.
  `staging/nest-city-account/TURNSTILE_SECRET_KEY`) and sync into `<service>-secret`.
- Credentials Terraform generates for the databases, RabbitMQ and Redis are mirrored to
  Passbolt as `read-only/<cluster>/<service>/<ENV_VAR_NAME>` — look-up only.

If you don't have Passbolt access, ask around on the konto.bratislava.sk team.

### Validation and build pipelines

By creating a PR, GitHub actions will run validation pipelines and Dockerized build, lint and test pipelines.

## Acknowledgments

This project utilizes the [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) library, which is an open-source project developed by [David J. Bradshaw](https://github.com/davidjbradshaw). We are grateful for the work that has been put into this library and its contribution to the open-source community.
