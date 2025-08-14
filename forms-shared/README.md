# Forms shared

This package contains all forms-related code that may or may not be shared between FE and BE. The code primarily consists of pure, testable functions that create a interconnected suite for working with forms. Because of that, some of the code might be used only in one place, but for easier testability (compared to testing a React/Nest.js app) or higher code visibility (related things are in the same place) it might belong here (especially if it's a pure utility function).

Core components of forms shared package are _form generator_, _form summary_, and _form definitions_.

## Form generator

It turned out that it's challenging and error-prone to write JSON schemas for `react-jsonschema-form` manually. Therefore, we've created this generator. It has numerous advantages:

- It allows us to programmatically write the definitions. The definitions are code, so their parts can be reused, stored as variables, custom helpers can be created, etc.
- JSONSchema supports a vast amount of features, but our implementation of the form supports only a tiny subset of them. Using the generator assures that the schemas contain only the supported features. For example, there is a specific way how files are represented in the form. The generator outputs the correct schema each time, and it's easy to change the implementation both in the generator and in the form implementation at the same time.
- We can encapsulate our custom logic into more meaningful components. For example, steps are not something that is supported natively by the form library. Each step is an item in the root `allOf` array of the schema. However, the generator exposes the `step` function which allows us to write the steps in a more declarative way.
- The types are shared between the generator and the application logic. This brings us type safety and allows us to refactor the code with confidence.

## Form summary

The important functionality of the application is not only the part where the user inputs the data, but also displaying the already inputted data. The previous attempts on parsing JSON schema and matching it with form data didn't go well (it's hard). Once we realized that we could leverage the ability of RJSF (the FE library) to display the form data even without any editable fields, it became easier. This approach, although cumbersome, works really well in practice. The core idea is that we render the form to XML (providing our components passed as widgets to the library) either server-side (which is possible) or client-side, and then parse the resulting XML to JSON (to be able to work with it easily). The summary JSON can be rendered via various summary renderers (FE summary in client facing app, Slovensko.sk, email).

## Form definitions

The definitions are concrete forms that are implemented via form generator. The `formDefinitions.ts` file is a single source of truth for all forms, therefore each committed change affects the existing systems. Some changes (e.g., changing a form type) might lead to unexpected behavior. Each change of the existing form must be evaluated regarding the impact on other parts of the system!

Currently, there are two types of the forms:

- Slovensko.sk
- Email

### Slovensko.sk forms

This form type is interoperable with [formulare.slovensko.sk](https://formulare.slovensko.sk/). Each form must be uploaded to the government database of the forms. There is generally a lack of documentation on the government solution. Most of the forms on the web are created via the official "eDesigner". We had to create our own container that would work with our solution by reverse engineering the official forms and keeping the important parts.

The government forms work with XML, however our data is in JSON. Also, each schema change usually requires to create a new container with a new updated schema. Because of the dynamic nature of our forms, creating a new schema on each update would be impossible, so we've decided to create a universal XML schema. All the container files are the same (except for the metadata) and the data XML contains JSON encoded as a string and rendered summary JSON that is displayed via various (HTML, PDF) XSLT transformers. This means that on form schema change, there's no need to update the government container.

To generate a government container, there's a command:

```bash
npm run generate-slovensko-sk
```

#### Tax form

It's a special case of Slovensko.sk form. Historically, this form was available on the old form solution (esluzby.bratislava.sk), and it had its own XML schemas. Because of compatibility requirements (mainly because it is processed by NORIS, not GINIS), for this form we don't use the universal XML schema, but instead map form data to the old schema. Besides that, the PDFs generated are not the summary but government tax forms which users can print.

### Creating a new form

The best way to create a new form definition is to look at already existing ones. The schema language was optimized to be generated by AI. There's a handy command to create an AI prompt, which contains all the existing forms and form generator functions:

```bash
npm run create-ai-prompt
```

Use Slovak language for all property names and select options in the form data! Many of the properties are not easily translatable which leads to mixed usage of languages or horrible translations.

## Prerequisites

### Installation

First, you need to install required prerequisites on macOS:
https://github.com/Automattic/node-canvas/wiki/Installation%3A-Mac-OS-X

```bash
  brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

Then to install node dependencies on macOS:

```bash
  npm install
```

If you are having problems with npm installation, you likely need to relink brew libraries:

```bash
  export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:/opt/X11/lib/pkgconfig
  brew install glib
  brew link glib
  # if command above not working use: brew link --overwrite glib
```

On Windows just use npm install as the binaries are included in the npm packages:

```bash
  npm install
```

Installing on Windows under WSL Ubuntu might need similar dependencies as macOS, so if the install throws errors, run:

```bash
  sudo apt-get update
  sudo apt-get install pkg-config libcairo2-dev libpango1.0-dev libpng-dev libjpeg-dev libgif-dev librsvg2-dev
```

And then proceed to npm install as usual:

```bash
  npm install
```

## Testing

Most of the code is tested by unit tests; in many cases this isn't always enough, especially with code interacting with the RJSF library. The library often gets updates that are buggy and break the expected functionality. Another case is that there are many real-world scenarios that are hard to grasp via unit testing. As a solution to minimize these risks, each form definition must have an example form. The example form consists of mock form data and mock files. If some functionality works with form definitions or form data, the output is usually snapshotted for each definition or example form. This is very useful; for example, if we change something in the internal workings of the form generator, we immediately see the difference in all generated schemas. If we change something related to summary JSON, we can see the snapshots (raw JSON, email image, PDF image) change.

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
