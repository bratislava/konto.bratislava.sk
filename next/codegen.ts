// eslint-disable-next-line import/no-extraneous-dependencies
import { CodegenConfig } from '@graphql-codegen/cli'

const codegenConfig: CodegenConfig = {
  // eslint-disable-next-line  no-process-env
  schema: process.env.CODEGEN_STRAPI_GRAPHQL_URL,
  documents: './clients/graphql-strapi/queries/**/*.{gql,graphql}',
  generates: {
    './clients/graphql-strapi/api.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
    },
  },
}

export default codegenConfig
