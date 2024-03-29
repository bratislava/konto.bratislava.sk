# Schema generator

It turned out that it's challenging and error-prone to write schemas and UI schemas for `react-jsonschema-form` manually. Therefore we've created this generator. It has numerous advantages:

- It allows us programmatically write the definitions. The definitions are code, so their parts can be reused, stored as variables, custom helpers can be created, etc.
- JSONSchema supports vast amount of features, our implementation of the form supports only a tiny subset of them. Using the generator assures that the schemas contain only the supported features. For example, there is a specific way how files are represented in the form. The generator outputs the correct schema each time and it's easy to change the implementation both in the generator and in the form implementation at the same time.
- We can encapsulate our custom logic into more meaningful components. For example, steps are not something that is supported natively by the form library. Each step is an item in the root `allOf` array of the schema. However, the generator exposes the `step` function which allows us to write the steps in a more declarative way.
- The types are shared between the generator and the application logic. This brings us type safety and allows us to refactor the code with confidence.

The generator is part of the `/next` folder out of necessity. It's not possible to easily share types between the generator and the application logic if the generator is not located in the same folder as the application logic. It also shares the same instance of RJSF form library.

## Usage

### Generating just schema and uiSchema

The generator is a simple TypeScript application. To create a new form, add a definition to `/definition` and implement it the `/cli.ts` file. **Keep the definition names (subdirectories) in sync with the slugs used on backend**. Add the script to `package.json` and then run it to generate the schemas. The schemas are located in `/dist`.

To generate all schemas:

```bash
  yarn generate:all
```

for single schema, for example:

```bash
  yarn generate:stanovisko-k-investicnemu-zameru
```

### Generate all schemas and files for BE and NASES, update them on BE

> To generate required xml files, you need @bratislava/jsxt installed locally

Run the following and let the script guide you. If you need modifications or you need to perform just some of the steps, modify `update.ts` to your needs.

```bash
  yarn update
```

## Notes
- `resolutions` for `jackspeak` in package.json is because of https://github.com/storybookjs/storybook/issues/22431#issuecomment-1630086092
- `ts-config` based on https://github.com/tsconfig/bases/blob/main/bases/node-lts.json
- `@rjsf+utils+5.15.0.patch` is duplicated patch from Next app, it will be removed after https://github.com/rjsf-team/react-jsonschema-form/pull/4121 is done
