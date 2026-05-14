import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import StyleGuidePageContent from '@/src/components/styleguide/StyleGuidePageContent'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { isProductionDeployment } from '@/src/frontend/utils/general'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

const StyleguidePage = () => {
  return <StyleGuidePageContent />
}

export const getServerSideProps = amplifyGetServerSideProps(async () => {
  if (isProductionDeployment()) return { notFound: true }

  return {
    props: {
      ...(await slovakServerSideTranslations()),
    },
  }
})

export default SsrAuthProviderHOC(StyleguidePage)
