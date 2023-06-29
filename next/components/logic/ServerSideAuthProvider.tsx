import { GetSSRCurrentAuth } from 'frontend/utils/amplify'
import { ComponentType, createContext } from 'react'

export const ServerSideAuthContext = createContext<GetSSRCurrentAuth>({
  userData: null,
  isAuthenticated: false,
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
