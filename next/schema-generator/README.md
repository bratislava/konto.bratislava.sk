# Schema generator

It turned out that it's challenging and error-prone to write schemas and UI schemas for `react-jsonschema-form` manually. Therefore we've created this generator. It has numerous advantages:
- It allows us programmatically write the definitions. The definitions are code, so their parts can be reused, stored as variables, custom helpers can be created, etc.
- JSONSchema supports vast amount of features, our implementation of the form supports only a tiny subset of them. Using the generator assures that the schemas contain only the supported features. For example, there is a specific way how files are represented in the form. The generator outputs the correct schema each time and it's easy to change the implementation both in the generator and in the form implementation at the same time.
- We can encapsulate our custom logic into more meaningful components. For example, steps are not something that is supported natively by the form library. Each step is an item in the root `allOf` array of the schema. However, the generator exposes the `step` function which allows us to write the steps in a more declarative way.
- The types are shared between the generator and the application logic. This brings us type safety and allows us to refactor the code with confidence.

The generator is part of the `/next` folder out of necessity. It's not possible to easily share types between the generator and the application logic if the generator is not located in the same folder as the application logic. It also shares the same instance of RJSF form library.

## Usage
The generator is a simple TypeScript application. To create a new form, add a definition to `/definition` and implement it the `/cli.ts` file. Add the script to `package.json` and then run it to generate the schemas. The schemas are located in `/dist`.
