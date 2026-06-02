import { CodegenConfig } from '@graphql-codegen/cli'
import { DirectiveLocation } from 'graphql'

// graphql-js v16 does not include DIRECTIVE_DEFINITION as a recognised directive
// location (it was added in v17 / June 2023 spec). Strapi returns @deprecated
// with this location. The `typescript` plugin calls
//   parse(printIntrospectionSchema(schema))
// which then fails with "Syntax Error: Unexpected Name 'DIRECTIVE_DEFINITION'".
// Patching the enum here makes the parser accept it before codegen processes the schema.
;(DirectiveLocation as Record<string, string>).DIRECTIVE_DEFINITION = 'DIRECTIVE_DEFINITION'

const codegenConfig: CodegenConfig = {
  schema: {
    'http://localhost:1337/graphql': {
      headers: { 'Content-Type': 'application/json' },
    },
  },
  documents: './src/clients/graphql-strapi/queries/**/*.{gql,graphql}',
  generates: {
    './src/clients/graphql-strapi/api.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
    },
  },
}

export default codegenConfig
