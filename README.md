# konto.bratislava.sk

This project is led by the [Department of Innovation and Technology of the City of Bratislava](https://inovacie.bratislava.sk). We're making it entirely open-source as we believe this promotes [savings, collaboration, auditability, and innovation](https://publiccode.eu) in the public sector.

Our goal is to be transparent about services we're developing and providing, as well as to invite other cities and municipalities to build on top of the same or similar open-source technologies we've already tested and used - to foster an ecosystem of collaboration between teams facing similar challenges. We'll be happy to [get in touch.](mailto:innovationteam@bratislava.sk)

> If you are an individual or a company who'd like to take part in these efforts, collaborate closely on development, or report an issue, we'd love to hear from you! 🙌 Contact us using this repository or at [innovationteam@bratislava.sk](mailto:innovationteam@bratislava.sk)

## What's here

Each sub-project contains a README which should get you up and running. More documentation can be (eventually) found [here](https://bratislava.github.io)

🏡 `/next` Next.js web app

👀 `/tests/cypress` Automated cypress tests

📟 `/forms-shared` Shared components and utils for frontend and backend

🗄️ `/strapi` Strapi CMS server

🗄️ `/nest-forms-backend` Service which is handling incoming and outgoing forms created by users

⚙️️ `/clamav` Instance of clamav https://www.clamav.net

⚙️️ `/cvdmirror` Local mirror of cvd database used for clamav scanner

🗄️ `/nest-clamav-scanner` This service is responsible for handling files which were sent to the clamav scanner.

🗄️ `/nest-tax-backend` This service is responsible for digital tax payment.

🗄️ `/nest-city-account` Service which is handling user related logic for konto

🐳 `docker-compose.yml` - if you need to quickly set up a postgres or meilisearch instance, run `docker compose up postgres`. You need docker installed

## Development

In this section, you will find instructions for development.

### Deployment

You can easily deploy the whole project to clusters by creating a tag `dev`, `staging`, or `prod` plus version, like `prod1.0.0`. This will first deploy the backend apps, and at the end, the frontend.
If you wish to deploy only a specific project, you can use a tag like `dev-next` or `dev-nest-forms-backend`, i.e. `dev-nest-forms-backend1.0.0`. This will work for `staging` and `prod` as well.

### Validation and build pipelines

By creating a PR, GitHub actions will run validation pipelines and build pipelines with `bratiska-cli`.

## Product specification

[Product specification](https://magistratba.sharepoint.com/:w:/s/InnovationTeam/Ee7urGwpSLBGnhyBYT5OJyAB9yPAd8xctA2I_xU6rYWbuA?e=ofobAR)

## Acknowledgments

This project utilizes the [iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) library, which is an open-source project developed by [David J. Bradshaw](https://github.com/davidjbradshaw). We are grateful for the work that has been put into this library and its contribution to the open-source community.
