# Shared resources

It turned out that it's challenging and error-prone to write schemas and UI schemas for `react-jsonschema-form` manually. Therefore, we've created this generator. It has numerous advantages:

- It allows us to programmatically write the definitions. The definitions are code, so their parts can be reused, stored as variables, custom helpers can be created, etc.
- JSONSchema supports vast amount of features, our implementation of the form supports only a tiny subset of them. Using the generator assures that the schemas contain only the supported features. For example, there is a specific way how files are represented in the form. The generator outputs the correct schema each time, and it's easy to change the implementation both in the generator and in the form implementation at the same time.
- We can encapsulate our custom logic into more meaningful components. For example, steps are not something that is supported natively by the form library. Each step is an item in the root `allOf` array of the schema. However, the generator exposes the `step` function which allows us to write the steps in a more declarative way.
- The types are shared between the generator and the application logic. This brings us type safety and allows us to refactor the code with confidence.

## Usage

### Instalation

First, you need to install required prerequisites on macOS:
https://github.com/Automattic/node-canvas/wiki/Installation%3A-Mac-OS-X

```bash
  brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

Then to install node dependencies on macOS:

```bash
  npm install
```

if you are having problems with npm installing, you likely need to relink brew libraries:

```bash
  export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig
  brew install glib
  brew link glib
  # if command above not working use: brew link --overwrite glib
```

on Windows just use npm install as the binaries are included in the npm packages:

```bash
  npm install
```

Installing on Windows under WSL Ubuntu might need similar dependencies as macOS, so if install throws errors, run:

```bash
  sudo apt-get update
  sudo apt-get install pkg-config libcairo2-dev libpango1.0-dev libpng-dev libjpeg-dev libgif-dev librsvg2-dev
```

and then proceed to npm install as usual:

```bash
  npm install
```

### Generating just schema

The generator is a simple TypeScript application. To create a new form, add a definition to `/definition` and implement it the `/cli.ts` file. **Keep the definition names (subdirectories) in sync with the slugs used on backend**. Add the script to `package.json` and then run it to generate the schemas. The schemas are located in `/dist`.

To generate all schemas:

```bash
  npm run generate-slovensko-sk
```

for a single schema, for example:

```bash
  npm run generate:stanovisko-k-investicnemu-zameru
```

### Generate all schemas and files for BE and NASES, update them on BE

> To generate required xml files, you need @bratislava/jsxt installed locally

Run the following and let the script guide you. If you need modifications, or you need to perform just some of the steps, modify `update.ts` to your needs.

```bash
  npm run update
```

### Generate snapshots

Powershell:

```pwsh
docker image rm my-test-image -f; if ($?) { } else { }; docker build -t my-test-image --target test-update .; docker run --rm -v ${PWD}:/app -v /app/node_modules my-test-image
```

Bash:

```bash
docker image rm my-test-image -f || true && docker build -t my-test-image --target test-update . && docker run --rm -v "${PWD}:/app" -v "/app/node_modules" my-test-image
```

## Testing

Due to inconsistencies in snapshot generation across different local machine environments, all tests must be run within a Docker container. This ensures a consistent environment for reliable test outcomes and snapshot comparisons.

You can run the tests using the following npm scripts:

```bash
# Run tests in Docker
npm run docker:test

# Run tests in Docker and update snapshots on your local filesystem
npm run docker:test:update
```

## Notes

- `ts-config` based on https://github.com/tsconfig/bases/blob/main/bases/node-lts.json
- `react-markdown` is fixed on version 6, until we use a compiler, see https://stackoverflow.com/a/69469619
