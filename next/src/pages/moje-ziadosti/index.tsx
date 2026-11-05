import { dehydrate, DehydratedState, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { formDefinitions } from 'forms-shared/definitions/formDefinitions'
import { isSlovenskoSkTaxFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { useTranslation } from 'next-i18next/pages'

import { strapiClient } from '@/src/clients/graphql-strapi'
import { GeneralQuery } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import {
  getMyApplicationsCountQueryKey,
  myApplicationsCountFetcher,
} from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationsCountFetcher'
import {
  getMyApplicationsFilters,
  getMyApplicationsQueryKey,
  myApplicationsFetcher,
} from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsFetcher/myApplicationsFetcher'
import MyApplicationsPageContent from '@/src/components/page-contents/MyApplicationsPageContent/MyApplicationsPageContent'
import { parseMyApplicationsFiltersFromServerUrlQuery } from '@/src/components/page-contents/MyApplicationsPageContent/myApplicationsUrlQuery'
import {
  FormDefinitionInfoBySlug,
  FormDefinitionInfoBySlugProvider,
} from '@/src/components/page-contents/MyApplicationsPageContent/useFormDefinitionInfoBySlug'
import SeoHead from '@/src/components/simple-components/SeoHead'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

type MyApplicationsPageProps = {
  general: GeneralQuery
  formDefinitionInfoBySlug: FormDefinitionInfoBySlug
  dehydratedState: DehydratedState
}

const getFormDefinitionInfoBySlug = (): FormDefinitionInfoBySlug =>
  Object.fromEntries(
    formDefinitions.map((formDefinition) => [
      formDefinition.slug,
      {
        title: formDefinition.title,
        isTaxForm: isSlovenskoSkTaxFormDefinition(formDefinition),
      },
    ]),
  )

export const getServerSideProps = amplifyGetServerSideProps<MyApplicationsPageProps>(
  async ({ context, fetchAuthSession }) => {
    const { selectedMyApplicationState, page } = parseMyApplicationsFiltersFromServerUrlQuery(
      context.query,
    )
    const filters = getMyApplicationsFilters({
      myApplicationState: selectedMyApplicationState,
      page,
    })

    const queryClient = new QueryClient()

    const [general] = await Promise.all([
      strapiClient.General(),
      // Auth session is request scoped, so it deliberately isn't part of the query keys
      // - they have to match the ones used on the client.
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryClient.prefetchQuery({
        queryKey: getMyApplicationsQueryKey(filters),
        queryFn: () => myApplicationsFetcher(filters, fetchAuthSession),
      }),
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryClient.prefetchQuery({
        queryKey: getMyApplicationsCountQueryKey(),
        queryFn: () => myApplicationsCountFetcher(fetchAuthSession),
      }),
    ])

    return {
      props: {
        general,
        formDefinitionInfoBySlug: getFormDefinitionInfoBySlug(),
        dehydratedState: dehydrate(queryClient),
        ...(await slovakServerSideTranslations()),
      },
    }
  },
  { requiresSignIn: true },
)

const MyApplicationsPage = ({
  general,
  formDefinitionInfoBySlug,
  dehydratedState,
}: MyApplicationsPageProps) => {
  const { t } = useTranslation()

  return (
    <HydrationBoundary state={dehydratedState}>
      <GeneralContextProvider general={general}>
        <SeoHead title={t('MyApplicationsPageContent.title')} />
        <PageLayout>
          <FormDefinitionInfoBySlugProvider formDefinitionInfoBySlug={formDefinitionInfoBySlug}>
            <MyApplicationsPageContent />
          </FormDefinitionInfoBySlugProvider>
        </PageLayout>
      </GeneralContextProvider>
    </HydrationBoundary>
  )
}

export default SsrAuthProviderHOC(MyApplicationsPage)
