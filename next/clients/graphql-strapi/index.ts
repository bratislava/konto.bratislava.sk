import { GraphQLClient } from 'graphql-request'

import { getSdk } from './api'

const gql = new GraphQLClient(`${process.env.STRAPI_URL}/graphql`)

export const client = getSdk(gql)
