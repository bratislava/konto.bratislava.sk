import FormCreatedRedirectPage, {
  FormCreatedRedirectPageProps,
} from '@/src/components/forms/FormCreatedRedirectPage'
import PageLayout from '@/src/components/layouts/PageLayout'
import FormLandingPage, {
  FormLandingPageProps,
} from '@/src/components/page-contents/FormLandingPageContent/FormLandingPageContent'

export type FormCreatedSplitPageProps =
  | ({
      type: 'redirect'
    } & FormCreatedRedirectPageProps)
  | ({
      type: 'landingPage'
    } & FormLandingPageProps)

const FormCreatedSplitPage = (props: FormCreatedSplitPageProps) => {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.type === 'redirect') {
    return <FormCreatedRedirectPage {...props} />
  }
  // eslint-disable-next-line react/destructuring-assignment
  if (props.type === 'landingPage') {
    return (
      <PageLayout>
        <FormLandingPage {...props} />
      </PageLayout>
    )
  }

  throw new Error('Invalid form type')
}

export default FormCreatedSplitPage
