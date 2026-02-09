import FormCalculator from 'components/forms/segments/FormCalculator/FormCalculator'
import { CustomComponentType } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import Alert from '../../info-components/Alert'
import AccountMarkdown from '../../segments/AccountMarkdown/AccountMarkdown'
import AccordionV2 from '../../simple-components/AccordionV2'
import Button from '../../simple-components/Button'

const CustomComponent = ({ id, component }: { id: string; component: CustomComponentType }) => {
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

  if (component.type === 'calculator') {
    return <FormCalculator id={id} {...component.props} />
  }

  if (component.type === 'alert') {
    return <Alert type={component.props.type} message={component.props.message} fullWidth />
  }

  return null
}

type CustomComponentProps = {
  id: string
  components?: CustomComponentType[]
}

const CustomComponents = ({ id, components = [] }: CustomComponentProps) => {
  return (
    <div className="flex flex-col gap-4">
      {components.map((component, key) => (
        <CustomComponent key={key} component={component} id={id} />
      ))}
    </div>
  )
}

export default CustomComponents
