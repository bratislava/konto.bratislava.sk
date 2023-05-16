/* eslint-disable no-secrets/no-secrets */
import { MetaUser } from '@grafana/faro-core'
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  // Cognito cookies are large and we were hitting limits on request header size on our infrastructure
  // TODO once we need cross-domain login, write our own "hybrid" storage, share only necessary data in cookies
  // sources:
  // https://github.com/aws-amplify/amplify-js/issues/1545
  // https://github.com/amazon-archives/amazon-cognito-identity-js/issues/688
  // https://github.com/aws-amplify/amplify-js/issues/5330
  // CookieStorage,
  IAuthenticationDetailsData,
} from 'amazon-cognito-identity-js'
import * as AWS from 'aws-sdk/global'
import { AWSError } from 'aws-sdk/global'
import { useStatusBarContext } from 'components/forms/info-components/StatusBar'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { APPROVED_SSO_ORIGINS } from 'frontend/utils/sso'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useInterval } from 'usehooks-ts'

import { subscribeApi, UNAUTHORIZED_ERROR_TEXT, verifyIdentityApi } from '../api/api'
import { ROUTES } from '../api/constants'
import { GeneralError } from '../dtos/generalApiDto'
import { isBrowser } from '../utils/general'
import logger, { faro } from '../utils/logger'
import useSnackbar from './useSnackbar'

export enum PostMessageTypes {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export interface CityAccountPostMessage {
  type: PostMessageTypes
  payload?: Record<string, string>
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

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  // Storage: new CookieStorage({
  //   domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
  // }),
}
const userPool = new CognitoUserPool(poolData)

export interface AccountError {
  message: string
  code: string
}

interface Account {
  login: (email: string, password: string | undefined) => Promise<boolean>
  logout: () => void
  forceLogout: () => void
  user: CognitoUser | null | undefined
  error: AccountError | undefined | null
  forgotPassword: (email?: string, fromMigration?: boolean) => Promise<boolean>
  confirmPassword: (verificationCode: string, password: string) => Promise<boolean>
  refreshUserData: () => Promise<void>
  status: AccountStatus
  setStatus: (status: AccountStatus) => void
  userData: UserData | null
  updateUserData: (data: UserData) => Promise<boolean>
  signUp: (
    email: string,
    password: string,
    marketingConfirmation: boolean,
    turnstileToken: string,
    data: UserData,
  ) => Promise<boolean>
  verifyEmail: (verificationCode: string) => Promise<boolean>
  resendVerificationCode: () => Promise<boolean>
  verifyIdentity: (rc: string, idCard: string, turnstileToken: string) => Promise<boolean>
  getAccessToken: () => Promise<string | null>
  postAccessToken: () => void
  lastAccessToken: string
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
  lastEmail: string
  isAuth: boolean
  resetError: () => void
}

const AccountContext = React.createContext<Account>({} as Account)

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CognitoUser | null | undefined>()
  const [error, setError] = useState<AccountError | undefined | null>(null)
  const [status, setStatus] = useState<AccountStatus>(AccountStatus.Idle)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [lastCredentials, setLastCredentials] = useState<IAuthenticationDetailsData>({
    Username: '',
  })
  const [lastMarketingConfirmation, setLastMarketingConfirmation] = useState(false)
  const [lastAccessToken, setLastAccessToken] = useState('')
  const { setStatusBarContent } = useStatusBarContext()
  const { t } = useTranslation()

  // TODO - could be better, currently used only after login, AccountStatus should be replaced or rewritten
  const mapTierToStatus = (tier?: Tier): AccountStatus => {
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

  const userAttributesToObject = (attributes?: CognitoUserAttribute[]): UserData => {
    const data: UserData = {}
    attributes?.forEach((attribute: CognitoUserAttribute) => {
      const attributeKey: string = attribute.getName().replace(/^custom:/, '')
      data[attributeKey] =
        attributeKey === 'address' ? JSON.parse(attribute.getValue()) : attribute.getValue()
    })
    return data
  }

  const objectToUserAttributes = (data: UserData | Address): CognitoUserAttribute[] => {
    const attributeList: CognitoUserAttribute[] = []
    Object.entries(data).forEach(([key, value]: [string, string | Tier | Address]) => {
      if (updatableAttributes.has(key)) {
        const attribute = new CognitoUserAttribute({
          Name: customAttributes.has(key) ? `custom:${key}` : key,
          Value:
            key === 'address'
              ? JSON.stringify(value)
              : key === 'phone_number' && typeof value === 'string'
              ? value?.replace(' ', '')
              : String(value),
        })
        attributeList.push(attribute)
      }
    })
    return attributeList
  }

  const logout = () => {
    if (user) {
      user.signOut()
      setUser(null)
      setUserData(null)
    }
  }

  // to be used when we find out login became invalid
  const forceLogout = () => {
    logout()
    // reloading should clear up any incorrect state app could be in
    // TODO - does not work nicely on user profile page - fix in another way
    // if (isBrowser()) {
    //   window.location.reload()
    // }
  }

  const getAccessToken = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser()
      if (cognitoUser == null) {
        resolve(null)
      } else {
        cognitoUser.getSession((err: Error | null, result: CognitoUserSession | null) => {
          if (err) {
            resolve(null)
          } else if (result) {
            const accessToken = result.getAccessToken().getJwtToken()
            setLastAccessToken(accessToken)
            resolve(accessToken)
          } else {
            resolve(null)
          }
        })
      }
    })
  }

  // postMessage to all approved domains at the window top
  // in reality only one message will be sent, this exists to limit the possible domains only to hardcoded list in APPROVED_SSO_ORIGINS
  // TODO refactor to different file
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const postMessageToApprovedDomains = (message: CityAccountPostMessage) => {
    // TODO - log to faro if none of the origins match
    APPROVED_SSO_ORIGINS.forEach((domain) => {
      window?.top?.postMessage(message, domain)
    })
  }

  // TODO refactor to different file
  // used in /sso, to send the jwt access token to approved domains where city-account is used for single sign on
  const postAccessToken = () => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser == null) {
      postMessageToApprovedDomains({
        type: PostMessageTypes.UNAUTHORIZED,
      })
      return
    }
    cognitoUser.getSession((err: Error | null, result: CognitoUserSession | null) => {
      if (err) {
        logger.error('Error getting session when sending access token: ', err)
        postMessageToApprovedDomains({
          type: PostMessageTypes.UNAUTHORIZED,
        })
      } else if (result) {
        const accessToken = result.getAccessToken().getJwtToken()
        postMessageToApprovedDomains({
          type: PostMessageTypes.ACCESS_TOKEN,
          payload: { accessToken },
        })
      }
    })
  }

  const subscribe = async () => {
    if (lastMarketingConfirmation === false) {
      return
    }

    const token = await getAccessToken()
    if (!token) {
      return
    }

    try {
      // the default behaviour when no channels are selected is to subscribe to everything
      await subscribeApi({}, token)
    } catch (_error: unknown) {
      // TODO temporary, pass better errors out of api requests
      const error: GeneralError = _error as GeneralError
      if (error?.message === UNAUTHORIZED_ERROR_TEXT) {
        forceLogout()
      }
      logger.error(error)
    }
  }

  const resendVerificationCode = (username = lastCredentials.Username): Promise<boolean> => {
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
      // Storage: new CookieStorage({
      //   domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
      // }),
    })

    setError(null)
    return new Promise((resolve) => {
      cognitoUser.resendConfirmationCode((err?: Error) => {
        if (err) {
          setError({ ...(err as AWSError) })
          logger.error('AWS error resendVerificationCode', err)
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  }

  const login = (email: string, password: string | undefined): Promise<boolean> => {
    // login into cognito using aws sdk
    const credentials = {
      Username: email,
      Password: password,
    }

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
      // Storage: new CookieStorage({
      //   domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
      // }),
    })

    setLastCredentials(credentials)
    setError(null)
    return new Promise((resolve) => {
      cognitoUser.authenticateUser(new AuthenticationDetails(credentials), {
        onSuccess(result: CognitoUserSession) {
          // POTENTIAL: Region needs to be set if not already set previously elsewhere.
          AWS.config.region = process.env.NEXT_PUBLIC_AWS_REGION

          const awsCredentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || '',
            Logins: {
              // Change the key below according to the specific region your user pool is in.
              [`cognito-idp.${String(process.env.NEXT_PUBLIC_AWS_REGION)}.amazonaws.com/${String(
                process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
              )}`]: result.getIdToken().getJwtToken(),
            },
          })
          setLastAccessToken(result.getAccessToken().getJwtToken())
          AWS.config.credentials = awsCredentials

          cognitoUser.getUserAttributes((err?: Error, attributes?: CognitoUserAttribute[]) => {
            if (err) {
              logger.error(err)
              resolve(false)
            } else {
              const cognitoUserData = userAttributesToObject(attributes)
              setUserData(cognitoUserData)
              setUser(cognitoUser)

              // refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
              awsCredentials.refresh((awsError?: AWSError) => {
                if (awsError) {
                  logger.error('AWS error login refresh', awsError)
                  resolve(false)
                } else {
                  resolve(true)
                }
              })
            }
          })
        },

        onFailure(err: AWSError) {
          if (err.code === 'UserNotConfirmedException') {
            resendVerificationCode(email).catch((error) => logger.error(error))
            setStatus(AccountStatus.EmailVerificationRequired)
          } else {
            logger.error('AWS error login', err)
            setError({ ...err })
          }
          resolve(false)
        },

        newPasswordRequired: (userAttributes, requiredAttributes) => {
          logger.warn('newPasswordRequired', userAttributes, requiredAttributes)
          resolve(false)
        },
        mfaRequired: (challengeName, challengeParameters) => {
          logger.warn('mfaRequired', challengeName, challengeParameters)
          resolve(false)
        },
        totpRequired: (challengeName, challengeParameters) => {
          logger.warn('totpRequired', challengeName, challengeParameters)
          resolve(false)
        },
        customChallenge: (challengeParameters) => {
          const challengeName = 'challenge-answer'
          logger.warn('customChallenge', challengeName, challengeParameters)
          resolve(false)
        },
        mfaSetup: (challengeName, challengeParameters) => {
          logger.warn('mfaSetup', challengeName, challengeParameters)
          resolve(false)
        },
        selectMFAType: (challengeName, challengeParameters) => {
          logger.warn('selectmfatype', challengeName, challengeParameters)
          resolve(false)
        },
      })
    })
  }

  const verifyEmail = (verificationCode: string): Promise<boolean> => {
    const cognitoUser = new CognitoUser({
      Username: lastCredentials?.Username,
      Pool: userPool,
      // Storage: new CookieStorage({
      //   domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
      // }),
    })

    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      cognitoUser.confirmRegistration(verificationCode, true, async (err?: AWSError) => {
        if (err) {
          setError({ ...err })
          logger.error('AWS error confirmRegistration', err)
          resolve(false)
        } else {
          setStatus(AccountStatus.EmailVerificationSuccess)
          const res = await login(lastCredentials.Username, lastCredentials.Password)
          await subscribe()
          resolve(res)
        }
      })
    })
  }

  const updateUserData = (data: UserData): Promise<boolean> => {
    const attributeList = objectToUserAttributes(data)

    setError(null)
    return new Promise((resolve) => {
      if (user) {
        user.updateAttributes(attributeList, (err?: Error) => {
          if (err) {
            setError({ ...(err as AWSError) })
            logger.error('AWS error updateUserData', err)
            resolve(false)
          } else {
            setUserData((state) => ({
              ...state,
              ...data,
            }))
            setError(null)
            resolve(true)
          }
        })
      } else {
        resolve(false)
      }
    })
  }

  const verifyIdentity = async (
    rc: string,
    idCard: string,
    turnstileToken: string,
  ): Promise<boolean> => {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return false
    }

    try {
      setError(null)
      await verifyIdentityApi(
        { birthNumber: rc.replace('/', ''), identityCard: idCard.toUpperCase(), turnstileToken },
        accessToken,
      )
      // not refreshing user status immediately, instead leaving this to the registration flow
      return true
    } catch (_error: unknown) {
      // TODO temporary, pass better errors out of api requests
      const error: GeneralError = _error as GeneralError
      if (error?.message === UNAUTHORIZED_ERROR_TEXT) {
        forceLogout()
        if (isBrowser()) {
          window.location.reload()
        }
      }
      logger.error('Failed verify identity request:', error)
      setError({
        code: error.message || 'error',
        message: error.message || 'error',
      })

      return false
    }
  }

  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const refreshUserData = useCallback(async () => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser !== null) {
      cognitoUser.getSession((err: Error | null, result: CognitoUserSession | null) => {
        if (err) {
          logger.error(err)
          setUser(null)
          return
        }

        // NOTE: getSession must be called to authenticate user before calling getUserAttributes
        cognitoUser.getUserAttributes(
          (cognitoError?: Error, attributes?: CognitoUserAttribute[]) => {
            if (cognitoError) {
              logger.error('AWS error getUserAttributes', cognitoError)
              setUser(null)
            } else if (!result) {
              logger.error('No result for access token')
              setUser(null)
            } else {
              const cognitoUserData = userAttributesToObject(attributes)
              setUserData(cognitoUserData)
              setUser(cognitoUser)
              setLastAccessToken(result?.getAccessToken().getJwtToken())
            }
          },
        )
      })
    } else {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUserData().catch((error) => logger.error(error))
  }, [refreshUserData])

  const signUp = async (
    email: string,
    password: string,
    marketingConfirmation: boolean,
    turnstileToken: string,
    data: UserData,
  ): Promise<boolean> => {
    const attributeList = objectToUserAttributes(data)
    const validationDataAttributeList = [
      new CognitoUserAttribute({
        Name: 'custom:turnstile_token',
        Value: turnstileToken,
      }),
    ]
    setLastCredentials({ Username: email, Password: password })
    setLastMarketingConfirmation(marketingConfirmation)
    setError(null)
    return new Promise((resolve) => {
      userPool.signUp(
        email,
        password,
        attributeList,
        validationDataAttributeList,
        (err?: Error) => {
          if (err) {
            setError({ ...(err as AWSError) })
            logger.error('AWS error signUp', err)
            resolve(false)
          } else {
            setStatus(AccountStatus.EmailVerificationRequired)
            resolve(true)
          }
        },
      )
    })
  }

  const changePassword = (oldPassword: string, newPassword: string): Promise<boolean> => {
    setError(null)
    return new Promise((resolve) => {
      if (user) {
        user.changePassword(oldPassword, newPassword, (err?: Error) => {
          if (err) {
            const customErr = { ...(err as AWSError) }
            if (customErr.code === 'NotAuthorizedException') {
              customErr.code = 'IncorectPasswordException'
              customErr.name = 'IncorectPasswordException'
            }
            setError(customErr)
            logger.error('AWS error changePassword', err)
            resolve(false)
          } else {
            setStatus(AccountStatus.NewPasswordSuccess)
            resolve(true)
          }
        })
      } else {
        resolve(false)
      }
    })
  }

  const confirmPassword = (verificationCode: string, password: string): Promise<boolean> => {
    const cognitoUser = new CognitoUser({
      Username: lastCredentials.Username,
      Pool: userPool,
      // Storage: new CookieStorage({
      //   domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
      // }),
    })

    return new Promise((resolve) => {
      cognitoUser.confirmPassword(verificationCode, password, {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async onSuccess() {
          setStatus(AccountStatus.NewPasswordSuccess)
          resolve(await login(lastCredentials.Username, password))
        },
        onFailure(err: Error) {
          setError({ ...(err as AWSError) })
          logger.error('AWS error confirmPassword', err)
          resolve(false)
        },
      })
    })
  }

  const forgotPassword = (email = '', fromMigration = false): Promise<boolean> => {
    const cognitoUser = new CognitoUser({
      Username: email || lastCredentials.Username,
      Pool: userPool,
      // Storage: new CookieStorage({
      //   domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
      // }),
    })

    if (email) {
      setLastCredentials({ Username: email })
    }
    setError(null)
    return new Promise((resolve) => {
      cognitoUser.forgotPassword({
        onSuccess: () => {
          // successfully initiated reset password request
          setStatus(AccountStatus.NewPasswordRequired)
          resolve(true)
        },
        onFailure: (err: Error) => {
          const customErr = { ...(err as AWSError) }
          if (fromMigration && customErr.code === 'UserNotFoundException') {
            customErr.code = 'MigrationUserNotFoundException'
            customErr.name = 'MigrationUserNotFoundException'
          }
          logger.error('AWS error forgotPassword', err)
          setError(customErr)
          resolve(false)
        },
      })
    })
  }

  useInterval(
    () => {
      refreshUserData().catch((error) => logger.error(error))
    },
    status === AccountStatus.IdentityVerificationPending ? 5000 : null,
  )

  // map tier to status, TODO think about dropping global status and using only tier
  useEffect(() => {
    // does nothing if faro isn't initialized yet
    faro?.api?.setUser(userData as MetaUser)
    // TODO these serve to guide users through multiple steps and should be dismissed only by them - don't update status automatically when here
    const tempStatuses = [
      AccountStatus.NewPasswordSuccess,
      AccountStatus.NewPasswordRequired,
      AccountStatus.EmailVerificationSuccess,
      AccountStatus.EmailVerificationRequired,
    ]
    if (tempStatuses.includes(status)) {
      logger.trace('Account status changed - temp registration status', { status })
      return
    }

    const newStatus = userData ? mapTierToStatus(userData.tier) : AccountStatus.Idle
    if (
      status === AccountStatus.IdentityVerificationPending &&
      newStatus === AccountStatus.IdentityVerificationSuccess
    ) {
      openSnackbarSuccess(t('account:identity_verification_success'))
    }
    if (newStatus !== status) {
      logger.trace('Account status changed', { oldStatus: status, newStatus })
      setStatus(newStatus)
    }
    // TODO not sure if userData?.tier is needed, needs verifications (@mpinter)
  }, [openSnackbarSuccess, status, t, userData, userData?.tier])

  useEffect(() => {
    // this overrides the 'global' status notification (i.e. crashed servers), but since we don't have design for multiple, showing failed notification probably takes precedence
    // TODO rethink the status bar approach on product side
    if (status === AccountStatus.IdentityVerificationFailed) {
      setStatusBarContent(
        <AccountMarkdown
          uLinkVariant="error"
          variant="sm"
          content={t('account:identity_verification_failed', { url: ROUTES.IDENTITY_VERIFICATION })}
        />,
      )
    } else {
      // TODO here set to whatever is the 'global' error
      setStatusBarContent('')
    }
  }, [setStatusBarContent, status, t])

  const router = useRouter()
  useEffect(() => {
    setError(null)
  }, [router.pathname])

  const resetError = () => {
    setError(null)
  }

  return (
    <AccountContext.Provider
      value={{
        login,
        logout,
        forceLogout,
        user,
        error,
        forgotPassword,
        confirmPassword,
        refreshUserData,
        status,
        setStatus,
        userData,
        updateUserData,
        signUp,
        verifyEmail,
        resendVerificationCode,
        verifyIdentity,
        getAccessToken,
        postAccessToken,
        lastAccessToken,
        changePassword,
        lastEmail: lastCredentials.Username,
        isAuth: user !== null,
        resetError,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export default function useAccount() {
  return useContext(AccountContext)
}
