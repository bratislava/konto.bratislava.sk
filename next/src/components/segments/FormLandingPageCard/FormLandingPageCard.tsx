import { Button } from '@bratislava/component-library'

import {
  FormLandingPageFormCtaFragment,
  FormLandingPageLinkCtaFragment,
} from '@/src/clients/graphql-strapi/api'

export type FormLandingPageCardProps =
  | FormLandingPageLinkCtaFragment
  | (FormLandingPageFormCtaFragment & {
      isLoading: boolean
      onPress: () => void
    })

/* eslint-disable react/destructuring-assignment */
const FormLandingPageButton = (props: FormLandingPageCardProps) => {
  if (props.__typename === 'ComponentBlocksFormLandingPageLinkCta') {
    return (
      <Button
        variant="outline"
        href={props.url}
        hasLinkIcon={false}
        target="_blank"
        fullWidthMobile
      >
        {props.buttonLabel}
      </Button>
    )
  }

  if (props.__typename === 'ComponentBlocksFormLandingPageFormCta') {
    return (
      <Button
        variant="solid"
        onPress={props.onPress}
        isLoading={props.isLoading}
        fullWidthMobile
        data-cy="form-landing-page-fill-form-button"
      >
        {props.buttonLabel}
      </Button>
    )
  }

  return null
}

const FormLandingPageCard = (props: FormLandingPageCardProps) => {
  return (
    <div className="flex flex-col gap-5 border-b border-gray-200 px-5 py-6 last:border-b-0 md:flex-row">
      <div className="flex grow flex-col justify-center gap-2">
        <div className="flex flex-col items-start gap-1 text-h6 md:flex-row md:items-center md:gap-3">
          {props.title}
        </div>
        {props.text && <span className="text-p3">{props.text}</span>}
      </div>
      <div className="flex shrink-0 items-center md:w-[150px] md:justify-center">
        <FormLandingPageButton {...props} />
      </div>
    </div>
  )
}
/* eslint-enable react/destructuring-assignment */

export default FormLandingPageCard
