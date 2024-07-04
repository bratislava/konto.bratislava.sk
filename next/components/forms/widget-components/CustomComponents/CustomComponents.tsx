import { CustomComponentType } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import Alert from '../../info-components/Alert'
import AccountMarkdown from '../../segments/AccountMarkdown/AccountMarkdown'
import PropertyTaxCalculator from '../../segments/PropertyTaxCalculator/PropertyTaxCalculator'
import AccordionV2 from '../../simple-components/AccordionV2'
import Button from '../../simple-components/ButtonNew'

const CustomComponent = ({ component }: { component: CustomComponentType }) => {
  if (component.type === 'accordion') {
    return (
      <AccordionV2 title={component.props?.title}>
        <AccountMarkdown content={component.props?.content} />
      </AccordionV2>
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

  if (component.type === 'alert') {
    return <Alert type={component.props.type} message={component.props.message} fullWidth />
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
