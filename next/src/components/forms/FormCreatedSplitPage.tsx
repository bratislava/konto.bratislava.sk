import FormCreatedRedirectPage, {
  FormCreatedRedirectPageProps,
} from '@/src/components/forms/FormCreatedRedirectPage'
import PageLayout from '@/src/components/layouts/PageLayout'
import FormLandingPage, {
  FormLandingPageProps,
} from '@/src/components/page-contents/FormLandingPageContent/FormLandingPageContent'
import MunicipalServicePageContent, {
  MunicipalServicePageContentProps,
} from '@/src/components/page-contents/MunicipalServicePageContent/MunicipalServicePageContent'
import SeoHead from '@/src/components/simple-components/SeoHead'

export type FormCreatedSplitPageProps =
  | ({
      type: 'redirect'
    } & FormCreatedRedirectPageProps)
  | ({
      type: 'landingPage'
    } & FormLandingPageProps)
  | ({
      type: 'municipalService'
    } & MunicipalServicePageContentProps)

const FormCreatedSplitPage = (props: FormCreatedSplitPageProps) => {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.type === 'redirect') {
    return <FormCreatedRedirectPage {...props} />
  }
  // eslint-disable-next-line react/destructuring-assignment
  if (props.type === 'landingPage') {
    return (
      <>
        <SeoHead title={props.formDefinition.title} />

        <PageLayout>
          <FormLandingPage {...props} />
        </PageLayout>
      </>
    )
  }

  if (props.type === 'municipalService') {
    return (
      <>
        <SeoHead title={props.municipalService.title} />

        <PageLayout>
          <MunicipalServicePageContent {...props} />
        </PageLayout>
      </>
    )
  }

  throw new Error('Invalid form type')
}

export default FormCreatedSplitPage
