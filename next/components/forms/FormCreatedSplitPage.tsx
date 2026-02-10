import FormCreatedRedirectPage, {
  FormCreatedRedirectPageProps,
} from '@/components/forms/FormCreatedRedirectPage'
import FormLandingPage, { FormLandingPageProps } from '@/components/forms/FormLandingPage'

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
    return <FormLandingPage {...props} />
  }

  throw new Error('Invalid form type')
}

export default FormCreatedSplitPage
