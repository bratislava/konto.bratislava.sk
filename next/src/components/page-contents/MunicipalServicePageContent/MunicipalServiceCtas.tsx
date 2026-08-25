import { Button } from '@bratislava/component-library'

import { MunicipalServiceEntityFragment } from '@/src/clients/graphql-strapi/api'
import { ClientLandingPageFormDefinition } from '@/src/components/forms/clientFormDefinitions'
import FormCtaButton from '@/src/components/page-contents/MunicipalServicePageContent/FormCtaButton'
import { isDefined } from '@/src/frontend/utils/general'

type Props = {
  municipalService: MunicipalServiceEntityFragment
  formDefinition?: ClientLandingPageFormDefinition
}

const MunicipalServiceCtas = ({ municipalService, formDefinition }: Props) => {
  const filteredLinks = municipalService.links?.filter(isDefined) ?? []

  return (
    <div className="flex flex-col gap-3">
      {formDefinition ? (
        <FormCtaButton
          formDefinition={formDefinition}
          buttonLabel={municipalService.formButtonLabel}
        />
      ) : null}

      {filteredLinks.length > 0
        ? filteredLinks.map((link) => (
            // TODO use getLinkProps when implemented
            <Button key={link.id} variant="outline" fullWidth href={link.url ?? '#'}>
              {link.label}
            </Button>
          ))
        : null}
    </div>
  )
}

export default MunicipalServiceCtas
