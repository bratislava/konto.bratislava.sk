import { GraphQLClient } from 'graphql-request'

import { environment } from '@/src/environment'

import { getSdk } from './api'

const gql = new GraphQLClient(`${environment.cityAccountStrapiUrl}/graphql`)

export const strapiClient = getSdk(gql)
