import { Amplify, Auth, withSSRContext } from 'aws-amplify'
import { ROUTES } from 'frontend/api/constants'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import { useEffect, useState } from 'react'

import logger from './logger'
import { APPROVED_SSO_ORIGINS } from './sso'

export enum PostMessageTypes {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export interface CityAccountPostMessage {
  type: PostMessageTypes
  payload?: Record<string, string>
}

export interface AccountError {
  message: string
  code: string
}

export enum AccountStatus {
  Idle,
  NewPasswordRequired,
  NewPasswordSuccess,
  EmailVerificationRequired,
  EmailVerificationSuccess,
  IdentityVerificationRequired,
  IdentityVerificationPending,
  IdentityVerificationFailed,
  IdentityVerificationSuccess,
}

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

export type AccountType = 'fo' | 'po'

// as returned by Amplify.Auth.currentAuthenticatedUser().attributes
// sent from BE as server side props
export interface UserData {
  sub?: string
  email_verified?: string
  email?: string
  name?: string
  given_name?: string
  family_name?: string
  phone_number?: string
  phone_verified?: string
  address?: string
  'custom:ifo'?: string
  'custom:tier'?: Tier
  'custom:account_type'?: AccountType
  'custom:turnstile_token'?: string
}

Amplify.configure({
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,

    // REQUIRED - Amazon Cognito Region
    region: process.env.NEXT_PUBLIC_AWS_REGION,

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,

    // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
    // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
    signUpVerificationMethod: 'code',
  },
  ssr: true,
})

// TODO - could be better, currently used only after login, AccountStatus should be replaced or rewritten
export const mapTierToStatus = (tier?: Tier): AccountStatus => {
  switch (tier) {
    case Tier.QUEUE_IDENTITY_CARD:
      return AccountStatus.IdentityVerificationPending
    case Tier.NOT_VERIFIED_IDENTITY_CARD:
      return AccountStatus.IdentityVerificationFailed
    case Tier.IDENTITY_CARD:
    case Tier.EID:
      return AccountStatus.IdentityVerificationSuccess
    case Tier.NEW:
      return AccountStatus.Idle
    default:
      return AccountStatus.IdentityVerificationRequired
  }
}

export const getAccessToken = async () => {
  try {
    const session = await Auth.currentSession()
    const jwtToken = session.getAccessToken().getJwtToken()
    if (!jwtToken) throw new Error('no jwt token found in current session')
    return jwtToken
  } catch (error) {
    logger.error('error getting access token - redirect to login', error)
    window.location.assign(ROUTES.LOGIN)
    throw error
  }
}

export interface GetSSRCurrentAuth {
  userData: UserData | null
}

// provides all the user data frontend might need as server side props
// this way, FE can always access cognito data in a sync manner
export const getSSRCurrentAuth = async (
  req: GetServerSidePropsContext['req'],
): Promise<GetSSRCurrentAuth> => {
  const SSR = withSSRContext({ req })
  let userData = null
  try {
    const currentUser = await SSR.Auth.currentAuthenticatedUser()
    userData = currentUser.attributes || null
  } catch (error) {
    // TODO filter out errors because of unauthenticated users
    logger.error('getServersideAuth error: ', error)
  }
  return { userData }
}

export const getSSRAccessToken = async (req: GetServerSidePropsContext['req']): Promise<string> => {
  const SSR = withSSRContext({ req })
  try {
    const currentSession = await SSR.Auth.currentSession()
    return (currentSession?.getAccessToken()?.getJwtToken() as string) || ''
  } catch (error) {
    // TODO filter out errors because of unauthenticated users
    logger.error('getServersideAuth error: ', error)
  }
  return ''
}

// postMessage to all approved domains at the window top
// in reality only one message will be sent, this exists to limit the possible domains only to hardcoded list in APPROVED_SSO_ORIGINS
// TODO refactor to different file
// eslint-disable-next-line unicorn/consistent-function-scoping
export const postMessageToApprovedDomains = (message: CityAccountPostMessage) => {
  // TODO - log to faro if none of the origins match
  APPROVED_SSO_ORIGINS.forEach((domain) => {
    window?.top?.postMessage(message, domain)
  })
}

// based on https://www.joshwcomeau.com/nextjs/refreshing-server-side-props/
// follow the link above if we need to add loading state
export const useRefreshServerSideProps = (dataToRefresh: unknown) => {
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const refreshData = async () => {
    setRefreshing(true)
    return router.replace(router.asPath)
  }

  useEffect(() => {
    setRefreshing(false)
  }, [dataToRefresh])

  return { refreshing, refreshData }
}
