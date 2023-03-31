import { EFormValue } from '@backend/forms'
import { getEform } from '@backend/utils/forms'
import { pageStyle } from '@utils/page'
import { AsyncServerProps } from '@utils/types'
import { forceString, isProductionDeployment } from '@utils/utils'
import GeneratedFormRJSF from 'components/forms/GeneratedFormRJSF'
import FormPageLayout from 'components/layouts/FormPageLayout'
import PageWrapper from 'components/layouts/PageWrapper'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (isProductionDeployment()) return { notFound: true }

  let eform: EFormValue
  try {
    eform = getEform(ctx.query.eform)
  } catch (error) {
    logger.error(error)
    return { notFound: true }
  }

  // necessary for page wrappers common for entire web
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      eform,
      page: {
        locale: ctx.locale,
        localizations: ['sk', 'en']
          .filter((l) => l !== ctx.locale)
          .map((l) => ({
            slug: '',
            locale: l,
          })),
      },
      ...(await serverSideTranslations(locale)),
    },
  }
}

// it looks like we will not need this, but we can keep it for now
// const initDefaultSchemaFields = (schema: StrictRJSFSchema) => {
//   if (!schema || typeof schema !== 'object') return
//   if (schema.type && schema.type !== 'object' && !schema.default) {
//     Object.assign(schema, { default: null })
//   }
//   Object.values(schema).forEach((value) => {
//     if (Array.isArray(value)) {
//       value.forEach((item) => initDefaultSchemaFields(item))
//     } else {
//       initDefaultSchemaFields(value)
//     }
//   })
// }

const FormTestPage = ({ page, eform }: AsyncServerProps<typeof getServerSideProps>) => {
  const router = useRouter()

  const formSlug = forceString(router.query.eform)
  // Using string.match because CodeQL tools ignore regex.test as SSRF prevention.
  // eslint-disable-next-line unicorn/prefer-regexp-test
  const escapedSlug = formSlug.match(/^[\da-z-]+$/) ? formSlug : ''
  const pageSlug = `form/${escapedSlug}`

  return (
    <PageWrapper
      locale={page.locale}
      localizations={[
        { locale: 'sk', slug: pageSlug },
        { locale: 'en', slug: pageSlug },
      ]}
    >
      <AccountPageLayout hiddenHeaderNav>
        <GeneratedFormRJSF eform={eform} escapedSlug={escapedSlug} formSlug={formSlug} />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default FormTestPage
