# Bratislava.sk

This readme should get you up & running. For more detailed documentation, check the /docs file in the root of the repo.

## First-time setup

You need `node` and `yarn` installed locally.

To install dependencies run:

```
yarn
```

### VSCode support

VSCode supports this plugin out of the box. However, sometimes it can use its own typescript version instead of the project one, resulting in not reading the local tsconfig. If you are using VSCode be sure to have `Use workspace version` option selected in `Typescript: Select Typescript Version...` command available in the [command pallete](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette).

<img width="729" alt="image" src="https://user-images.githubusercontent.com/35625949/153884371-e0f488d4-05b8-4b88-93d2-1caa7e6081f7.png">

## Run project locally

```
yarn dev
```

## FOP

Apache™ FOP (Formatting Objects Processor) is a print formatter driven by XSL formatting objects (XSL-FO) and an output independent formatter. It is a Java application that reads a formatting object (FO) tree and renders the resulting pages to a specified output.

We are using [FOP](https://xmlgraphics.apache.org/fop/) to transform eForms to pdf. If you'd like to use this feature, Java 1.7 or later RE must be installed on your system. See [FOP Quick start guide](https://xmlgraphics.apache.org/fop/quickstartguide.html)

## API clients generation

We are using [openapi-generator-cli](https://openapi-generator.tech/) to generate API clients based on OpenAPI specification provided by our BEs. To generate API clients run `yarn generate-clients`. `--skip-validate-spec` flag is required until all errors in the specification are resolved.

Forms:

- [Swagger](https://nest-forms-backend.staging.bratislava.sk/api)
- [API JSON](https://nest-forms-backend.staging.bratislava.sk/api-json)

City account:

- [Swagger](https://nest-city-account.staging.bratislava.sk/api)
- [API JSON](https://nest-city-account.staging.bratislava.sk/api-json)
