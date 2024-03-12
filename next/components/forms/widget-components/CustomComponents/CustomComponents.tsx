import { CustomComponentType } from '@schema-generator/generator/uiOptionsTypes'
import React from 'react'

import PropertyTaxCalculator from '../../segments/PropertyTaxCalculator/PropertyTaxCalculator'
import Accordion from '../../simple-components/Accordion'
import Button from '../../simple-components/ButtonNew'

const CustomComponent = ({ component }: { component: CustomComponentType }) => {
  if (component.type === 'accordion') {
    return (
      <Accordion
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        size={component.props?.size}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        title={component.props?.title}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        shadow={component.props?.shadow}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        content={component.props?.content}
      />
    )
  }

  if (component.type === 'additionalLinks') {
    return (
      <div className="flex flex-col gap-2">
        {component.props?.links?.map(({ title, href }) => (
          <Button key={title} variant="black-link" href={href} hasLinkIcon>
            {title}
          </Button>
        ))}
      </div>
    )
  }

  if (component.type === 'propertyTaxCalculator') {
    return <PropertyTaxCalculator {...component.props} />
  }

  return null
}

type CustomComponentProps = {
  components?: CustomComponentType[]
}

const CustomComponents = ({ components = [] }: CustomComponentProps) => {
  return (
    <div className="flex flex-col gap-4">
      {components.map((component, key) => (
        <CustomComponent key={key} component={component} />
      ))}
    </div>
  )
}

export default CustomComponents
