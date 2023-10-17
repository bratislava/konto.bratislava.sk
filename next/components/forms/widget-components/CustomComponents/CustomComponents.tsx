import React from 'react'
import { CustomComponentType } from 'schema-generator/generator/uiOptionsTypes'

import PropertyTaxCalculator from '../../segments/PropertyTaxCalculator/PropertyTaxCalculator'
import Accordion from '../../simple-components/Accordion'
import Button from '../../simple-components/ButtonNew'

const CustomComponent = ({ component }: { component: CustomComponentType }) => {
  if (component.type === 'accordion') {
    return (
      <Accordion
        size={component.props?.size}
        title={component.props?.title}
        shadow={component.props?.shadow}
        content={component.props?.content}
      />
    )
  }

  if (component.type === 'additionalLinks') {
    return (
      <div className="flex flex-col gap-2">
        {component.props?.links?.map(({ title, href }) => (
          <Button key={title} variant="category-link" href={href} hasLinkIcon>
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
