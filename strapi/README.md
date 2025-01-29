# konto.bratislava.sk Strapi CMS

## 🧰 Setup

Before you start, install all dependencies and create `.env.local` file which is .gitignored used for local dev

```
npm install
cp .env.example .env.local
```

You need postgres running locally (with correct credentials & database available). The default setup is in `.env.example`, you can override any of the variables by passing them in you `.env.local` file.

You can use docker-compose to run postgres locally:

```
docker compose up postgres
```

### Starting from empty database

While not recommended once data is in, you can start by simply running `npm run dev` with an empty database. Strapi will create the tables and you can start from scratch.

### Seeding the database

It's recommended that you don't start from an empty database, but instead seed with staging or production data. Ask in the internal Bratislava team or [follow the docs](https://bratislava.github.io/docs/recipes/load-strapi-db-in-local-dev). If you are an open-source contributor, note you do not need this setup for many of frontend-related changes. See the next.js project README.

We may provide a db dump as part of the project in the future - for now please contact the BA Innovations Team if you need it.

## 🚀 Development

Start the development server:

```bash
npm run dev
```

## Patches

We use [patch-package](https://github.com/ds300/patch-package) to slightly change the behavior of some packages. See the `patches` folder for more details.

When updating these packages, please run also `patch-package`:

```
npm run patch-package @strapi/plugin-users-permissions
```
