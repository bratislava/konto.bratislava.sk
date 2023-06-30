import { withSSRContext } from 'aws-amplify'
import { UserData } from 'frontend/dtos/accountDto'
import logger from 'frontend/utils/logger'
import { GetServerSidePropsContext } from 'next'
import { ComponentType, createContext } from 'react'

export interface GetSSRCurrentAuth {
  userData: UserData | null
}

// provides all the user data frontend might need as server side props
// this way, FE can always access cognito data in a sync manner
// TODO types should get fixed in amplify-js v6 release
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

// TODO types should get fixed in amplify-js v6 release
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

export const ServerSideAuthContext = createContext<GetSSRCurrentAuth>({
  userData: null,
})

export const ServerSideAuthProviderHOC = <Props extends { ssrCurrentAuthProps: GetSSRCurrentAuth }>(
  Wrapped: ComponentType<Props>,
) => {
  // eslint-disable-next-line react/function-component-definition
  return (props: Props) => (
    // eslint-disable-next-line react/destructuring-assignment
    <ServerSideAuthContext.Provider value={props.ssrCurrentAuthProps}>
      <Wrapped {...props} />
    </ServerSideAuthContext.Provider>
  )
}
