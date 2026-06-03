import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthSession } from 'aws-amplify/auth'
import {
  ConsentEnum,
  SetDeliveryMethodPreferenceDtoDeliveryMethodEnum,
} from 'openapi-clients/city-account'

import { cityAccountClient } from '@/src/clients/city-account'

const userQueryKey = ['user']

export const prefetchUserQuery = async (
  queryClient: QueryClient,
  getSsrAuthSession: () => Promise<AuthSession>,
) =>
  // https://github.com/TanStack/query/discussions/3306#discussioncomment-2205514
  queryClient.fetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: userQueryKey,
    queryFn: () =>
      cityAccountClient
        .userControllerGetOrCreateUser({ authStrategy: 'authOnly', getSsrAuthSession })
        .then((response) => response.data),
  })

export const useUser = () => {
  const queryClient = useQueryClient()

  const { data: userData } = useQuery({
    queryKey: userQueryKey,
    queryFn: () =>
      cityAccountClient
        .userControllerGetOrCreateUser({ authStrategy: 'authOnly' })
        .then((response) => response.data),
    staleTime: Infinity,
  })

  const initialData = queryClient.getQueryData(userQueryKey)
  if (!initialData || !userData) {
    // This hook relies on the user data being prefetched, so we throw an error if it's not.
    throw new Error('User data has not been prefetched')
  }

  return {
    userData,
  }
}

export const useGdprConsent = (consentType: ConsentEnum) => {
  const queryClient = useQueryClient()
  const { userData } = useUser()

  const currentConsent = userData.consents.find((consent) => consent.consentType === consentType)
  const isGranted = currentConsent?.isGranted ?? false

  const { mutateAsync: changeConsent, isPending: consentChangePending } = useMutation({
    mutationFn: (grant: boolean) =>
      cityAccountClient.userControllerUpdateGdprConsent(
        { consentType, grant },
        { authStrategy: 'authOnly' },
      ),
    onSuccess: () => queryClient.refetchQueries({ queryKey: userQueryKey }),
    networkMode: 'always',
  })

  return {
    isGranted,
    changeConsent,
    consentChangePending,
  }
}

export const useDeliveryMethod = () => {
  const queryClient = useQueryClient()

  const { mutateAsync: changeDeliveryMethod, isPending: deliveryMethodChangePending } = useMutation(
    {
      mutationFn: (deliveryMethod: SetDeliveryMethodPreferenceDtoDeliveryMethodEnum) =>
        cityAccountClient.userControllerSetDeliveryMethodPreference(
          { deliveryMethod },
          { authStrategy: 'authOnly' },
        ),
      onSuccess: () => queryClient.refetchQueries({ queryKey: userQueryKey }),
      networkMode: 'always',
    },
  )

  return {
    changeDeliveryMethod,
    deliveryMethodChangePending,
  }
}

export const useUserUpdateBloomreachData = () => {
  const { mutateAsync: updateBloomreachData, isPending: updateBloomreachDataPending } = useMutation(
    {
      mutationFn: () =>
        cityAccountClient.userControllerUpdateOrCreateBloomreachCustomer({
          authStrategy: 'authOnly',
        }),
      networkMode: 'always',
      onSuccess: () => {},
      onError: () => {},
    },
  )

  return { updateBloomreachData, updateBloomreachDataPending }
}
