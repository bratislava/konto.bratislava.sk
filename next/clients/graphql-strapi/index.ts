import { GraphQLClient } from 'graphql-request'

import { getSdk } from './api'
import { environment } from '@/environment'

const gql = new GraphQLClient(`${environment.cityAccountStrapiUrl}/graphql`)

export const strapiClient = getSdk(gql)
