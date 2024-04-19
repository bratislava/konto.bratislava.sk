// eslint-disable-next-line import/no-extraneous-dependencies
import { CodegenConfig } from '@graphql-codegen/cli'

const codegenConfig: CodegenConfig = {
  schema: 'http://localhost:1337/graphql',
  documents: './clients/graphql-strapi/queries/**/*.{gql,graphql}',
  generates: {
    './clients/graphql-strapi/api.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
    },
  },
}

export default codegenConfig
