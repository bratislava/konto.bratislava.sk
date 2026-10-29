import { CodegenConfig } from '@graphql-codegen/cli'

const codegenConfig: CodegenConfig = {
  schema: '../strapi/schema.graphql',
  documents: './src/clients/graphql-strapi/queries/**/*.{gql,graphql}',
  generates: {
    './src/clients/graphql-strapi/api.ts': {
      // typescript-operations generates the schema types the operations use, so the `typescript`
      // plugin (all schema types) isn't needed.
      plugins: ['typescript-operations', 'typescript-graphql-request'],
      config: {
        // The enums are used as values, e.g. `Enum_Municipalservice_Color.Transport`.
        enumType: 'native',
        // Custom scalars default to `unknown`. These are serialized as strings by Strapi.
        scalars: {
          Date: 'string',
          DateTime: 'string',
          I18NLocaleCode: 'string',
          Long: 'string',
          Time: 'string',
        },
      },
    },
  },
}

export default codegenConfig
