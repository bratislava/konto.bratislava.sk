import type { IGraphQLConfig } from 'graphql-config'
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: IGraphQLConfig = {
  projects: {
    strapi: {
      schema: ['http://localhost:1338/graphql'],
      documents: ['./clients/graphql-strapi/queries/**/*.{gql,graphql}'],
      extensions: {
        codegen: {
          generates: {
            './clients/graphql-strapi/api.ts': {
              plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
            },
          },
        } satisfies CodegenConfig,
      },
    },
    'strapi-bratislava': {
      schema: [
        'https://raw.githubusercontent.com/bratislava/bratislava.sk/refs/heads/master/strapi/schema.graphql',
      ],
      documents: ['./clients/graphql-strapi-bratislava/queries/**/*.{gql,graphql}'],
      extensions: {
        codegen: {
          generates: {
            './clients/graphql-strapi-bratislava/api.ts': {
              plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
            },
          },
        } satisfies CodegenConfig,
      },
    },
  },
}

export default config
