import { GraphQLClient } from 'graphql-request'

import { getSdk } from './api'
import { environment } from 'environment'

const gql = new GraphQLClient(`${environment.bratislavaStrapiUrl}/graphql`)

export const strapiBratislavaClient = getSdk(gql)
