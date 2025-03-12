import { cityAccountClient } from '@clients/city-account'
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError, AxiosResponse } from 'axios'
import {
  GdprDataDto,
  ResponseGdprUserDataDtoSubTypeEnum,
  ResponseUserDataDto,
} from 'openapi-clients/city-account'

const userQueryKey = ['user']

export const prefetchUserQuery = async (
  queryClient: QueryClient,
  accessTokenSsrGetFn: () => Promise<string | null>,
) =>
  // https://github.com/TanStack/query/discussions/3306#discussioncomment-2205514
  queryClient.fetchQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: userQueryKey,
    queryFn: () =>
      cityAccountClient
        .userControllerGetOrCreateUser({ accessToken: 'always', accessTokenSsrGetFn })
        .then((response) => response.data),
  })

export const useUser = () => {
  const queryClient = useQueryClient()

  const { data: userData } = useQuery({
    queryKey: userQueryKey,
    queryFn: () =>
      cityAccountClient
        .userControllerGetOrCreateUser({ accessToken: 'always' })
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

export const useUserSubscription = (gdprData: GdprDataDto) => {
  const queryClient = useQueryClient()
  const { userData } = useUser()

  const currentGdprData = userData?.gdprData.find(
    ({ category, type }) => category === gdprData.category && type === gdprData.type,
  )

  const subType = currentGdprData?.subType
  const isSubscribed = subType === ResponseGdprUserDataDtoSubTypeEnum.Subscribe

  const { mutateAsync: changeSubscription, isPending: subscriptionChangePending } = useMutation<
    AxiosResponse<ResponseUserDataDto>,
    AxiosError,
    boolean
  >({
    mutationFn: (subscribe) => {
      const endpoint = subscribe
        ? cityAccountClient.userControllerSubscribeLoggedUser
        : cityAccountClient.userControllerUnsubscribeLoggedUser

      return endpoint(
        {
          gdprData: [gdprData],
        },
        {
          accessToken: 'always',
        },
      )
    },
    onSuccess: (response) => {
      // Subscribe / unsubscribe endpoints return new user data, so we can update the cache and there is no need for
      // refetch.
      queryClient.setQueryData(userQueryKey, () => response.data)
    },
    networkMode: 'always',
  })

  return { subType, isSubscribed, changeSubscription, subscriptionChangePending }
}
