import { subscribeApi, verifyIdentityApi } from '@utils/api'
import { ROUTES } from '@utils/constants'
import useSnackbar from '@utils/useSnackbar'
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  CookieStorage,
  IAuthenticationDetailsData,
} from 'amazon-cognito-identity-js'
import * as AWS from 'aws-sdk/global'
import { AWSError } from 'aws-sdk/global'
import { useStatusBarContext } from 'components/forms/info-components/StatusBar'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useInterval } from 'usehooks-ts'

import logger, { faro } from './logger'

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
  Storage: new CookieStorage({
    domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
  }),
}
const userPool = new CognitoUserPool(poolData)

export interface AccountError {
  message: string
  code: string
}

interface Account {
  login: (email: string, password: string | undefined) => Promise<boolean>
  logout: () => void
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
  const { setStatusBarContent } = useStatusBarContext()
  const { t } = useTranslation()

  // TODO - could be better, currently used only after login, AccountStatus should be replaced or rewritten
  const mapTierToStatus = (tier: Tier): AccountStatus => {
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
    const data: any = {}
    attributes?.forEach((attribute: CognitoUserAttribute) => {
      const attributeKey: string = attribute.getName().replace(/^custom:/, '')
      data[attributeKey] =
        attributeKey === 'address' ? JSON.parse(attribute.getValue()) : attribute.getValue()
    })
    return data
  }

  const objectToUserAttributes = (data: UserData | Address): CognitoUserAttribute[] => {
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
    } catch (error) {
      logger.error(error)
    }
  }

  const verifyEmail = (verificationCode: string): Promise<boolean> => {
    const cognitoUser = new CognitoUser({
      Username: lastCredentials?.Username,
      Pool: userPool,
      Storage: new CookieStorage({
        domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
      }),
    })

    return new Promise((resolve) => {
      cognitoUser.confirmRegistration(verificationCode, true, async (err?: AWSError) => {
        if (err) {
          setError({ ...err })
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

  const resendVerificationCode = (): Promise<boolean> => {
    const cognitoUser = new CognitoUser({
      Username: lastCredentials.Username,
      Pool: userPool,
      Storage: new CookieStorage({
        domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
      }),
    })

    setError(null)
    return new Promise((resolve) => {
      cognitoUser.resendConfirmationCode((err?: Error) => {
        if (err) {
          setError({ ...(err as AWSError) })
          resolve(false)
        } else {
          resolve(true)
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
            resolve(accessToken)
          } else {
            resolve(null)
          }
        })
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
    } catch (error: any) {
      setError({
        code: error.message,
        message: error.message,
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
        cognitoUser.getUserAttributes((err?: Error, attributes?: CognitoUserAttribute[]) => {
          if (err) {
            logger.error(err)
            setUser(null)
            return
          }

          const userData = userAttributesToObject(attributes)
          setUserData(userData)
          setUser(cognitoUser)
        })
      })
    } else {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUserData().catch((error) => logger.error(error))
  }, [refreshUserData])

  const logout = () => {
    if (user) {
      user.signOut()
      setUser(null)
      setUserData(null)
    }
  }

  const signUp = (
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
      Storage: new CookieStorage({
        domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
      }),
    })

    return new Promise((resolve) => {
      cognitoUser.confirmPassword(verificationCode, password, {
        async onSuccess() {
          setStatus(AccountStatus.NewPasswordSuccess)
          // seems like user is set even without login but without attributes at this point - try refreshing user data
          refreshUserData().catch((error) => logger.error(error))
          resolve(await login(lastCredentials.Username, password))
        },
        onFailure(err: Error) {
          setError({ ...(err as AWSError) })
          resolve(false)
        },
      })
    })
  }

  const forgotPassword = (email = '', fromMigration = false): Promise<boolean> => {
    const cognitoUser = new CognitoUser({
      Username: email || lastCredentials.Username,
      Pool: userPool,
      Storage: new CookieStorage({
        domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
      }),
    })

    if (email) {
      setLastCredentials({ Username: email })
    }
    setError(null)
    return new Promise((resolve) => {
      cognitoUser.forgotPassword({
        onSuccess: (data) => {
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
          setError(customErr)
          resolve(false)
        },
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
      Storage: new CookieStorage({
        domain: process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
      }),
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
              [`cognito-idp.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID}`]:
                result.getIdToken().getJwtToken(),
            },
          })
          AWS.config.credentials = awsCredentials

          cognitoUser.getUserAttributes((err?: Error, attributes?: CognitoUserAttribute[]) => {
            if (err) {
              logger.error(err)
              resolve(false)
            } else {
              const userData = userAttributesToObject(attributes)
              setUserData(userData)
              setUser(cognitoUser)

              // refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
              awsCredentials.refresh((err?: AWSError) => {
                if (err) {
                  logger.error(err)
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
            setStatus(AccountStatus.EmailVerificationRequired)
          } else {
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

  useInterval(
    () => {
      refreshUserData().catch((error) => logger.error(error))
    },
    status === AccountStatus.IdentityVerificationPending ? 5000 : null,
  )

  // map tier to status, TODO think about dropping global status and using only tier
  useEffect(() => {
    // does nothing if faro isn't initialized yet
    faro?.api?.setUser(userData)
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
  }, [openSnackbarSuccess, status, t, userData])

  useEffect(() => {
    // this overrides the 'global' status notification (i.e. crashed servers), but since we don't have design for multiple, showing failed notification probably takes precedence
    // TODO rethink the status bar approach on product side
    if (status === AccountStatus.IdentityVerificationFailed) {
      setStatusBarContent(
        <AccountMarkdown
          uLinkVariant="error"
          variant="sm"
          content={t('account:identity_verification_failed', { url: ROUTES.REGISTER })}
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
