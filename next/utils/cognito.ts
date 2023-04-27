import { CognitoUserAttribute } from 'amazon-cognito-identity-js'
import { JSONObject } from './types'

export enum Tier {
  NEW = 'NEW',
  QUEUE_IDENTITY_CARD = 'QUEUE_IDENTITY_CARD',
  NOT_VERIFIED_IDENTITY_CARD = 'NOT_VERIFIED_IDENTITY_CARD',
  IDENTITY_CARD = 'IDENTITY_CARD',
  EID = 'EID',
}

export interface Address {
  formatted?: string
  street_address?: string
  locality?: string
  region?: string
  postal_code?: string
  country?: string
  phone_number?: string
}

export interface UserData {
  sub?: string
  email_verified?: string
  email?: string
  name?: string
  given_name?: string
  family_name?: string
  phone_number?: string
  phone_verified?: string
  address?: Address
  ifo?: string
  tier?: Tier
}

// non standard, has prefix custom: in cognito
const customAttributes = new Set(['ifo', 'tier'])
const updatableAttributes = new Set([
  'name',
  'given_name',
  'family_name',
  'phone_number',
  'address',
  'tier',
])

export const objectToCognitoUserAttributes = (data: UserData | Address): CognitoUserAttribute[] => {
  const attributeList: CognitoUserAttribute[] = []
  Object.entries(data).forEach(([key, value]) => {
    if (updatableAttributes.has(key)) {
      const attribute = new CognitoUserAttribute({
        Name: customAttributes.has(key) ? `custom:${key}` : key,
        Value:
          key === 'address'
            ? JSON.stringify(value)
            : key === 'phone_number'
            ? value?.replace(' ', '')
            : value,
      })
      attributeList.push(attribute)
    }
  })
  return attributeList
}

export const cognitoUserAttributesToObject = (attributes?: CognitoUserAttribute[]): UserData => {
  const data: JSONObject = {}
  attributes?.forEach((attribute: CognitoUserAttribute) => {
    const attributeKey: string = attribute.getName().replace(/^custom:/, '')
    data[attributeKey] =
      attributeKey === 'address' ? JSON.parse(attribute.getValue()) : attribute.getValue()
  })
  return data
}
