import { cityAccountApi } from '@clients/city-account'
import {
  GdprDataDto,
  GdprDataDtoCategoryEnum,
  GdprDataDtoTypeEnum,
} from '@clients/openapi-city-account'
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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
      cityAccountApi
        .userControllerGetOrCreateUser({ accessToken: 'always', accessTokenSsrGetFn })
        .then((response) => response.data),
  })

const useSubscriptionByType = (gdprData: GdprDataDto, type: 'subscribe' | 'unsubscribe') => {
  const queryClient = useQueryClient()
  const endpoint = {
    subscribe: cityAccountApi.userControllerSubscribeLoggedUser,
    unsubscribe: cityAccountApi.userControllerUnsubscribeLoggedUser,
  }[type]

  return useMutation({
    mutationFn: () =>
      endpoint(
        {
          gdprData: [gdprData],
        },
        {
          accessToken: 'always',
        },
      ),
    onSuccess: (response) => {
      // Subscribe / unsubscribe endpoints return new user data, so we can update the cache and there is no need for
      // refetch.
      queryClient.setQueryData(userQueryKey, () => response.data)
    },
    networkMode: 'always',
  })
}

const useSubscribeUnsubscribe = (gdprData: GdprDataDto) => {
  const subscribeMutation = useSubscriptionByType(gdprData, 'subscribe')
  const unsubscribeMutation = useSubscriptionByType(gdprData, 'unsubscribe')

  return [subscribeMutation, unsubscribeMutation]
}

export const useUserV2 = () => {
  const queryClient = useQueryClient()
  const initialData = queryClient.getQueryData(userQueryKey)

  if (!initialData) {
    // This hook relies on the user data being prefetched, so we throw an error if it's not.
    throw new Error('User data has not been prefetched')
  }

  const { data: userData } = useQuery({
    queryKey: userQueryKey,
    queryFn: () =>
      cityAccountApi
        .userControllerGetOrCreateUser({ accessToken: 'always' })
        .then((response) => response.data),
    staleTime: Infinity,
  })

  const [
    { mutate: taxesMarketingSubscribe, isPending: taxesMarketingSubscribeIsPending },
    { mutate: taxesMarketingUnsubscribe, isPending: taxesMarketingUnsubscribeIsPending },
  ] = useSubscribeUnsubscribe({
    category: GdprDataDtoCategoryEnum.Taxes,
    type: GdprDataDtoTypeEnum.Marketing,
  })

  const [
    {
      mutate: taxesFormalCommunicationSubscribe,
      isPending: taxesFormalCommunicationSubscribeIsPending,
    },
    {
      mutate: taxesFormalCommunicationUnsubscribe,
      isPending: taxesFormalCommunicationUnsubscribeIsPending,
    },
  ] = useSubscribeUnsubscribe({
    category: GdprDataDtoCategoryEnum.Taxes,
    type: GdprDataDtoTypeEnum.FormalCommunication,
  })

  return {
    userData,
    taxesMarketingSubscribe,
    taxesMarketingSubscribeIsPending,
    taxesMarketingUnsubscribe,
    taxesMarketingUnsubscribeIsPending,
    taxesFormalCommunicationSubscribe,
    taxesFormalCommunicationSubscribeIsPending,
    taxesFormalCommunicationUnsubscribe,
    taxesFormalCommunicationUnsubscribeIsPending,
  }
}
