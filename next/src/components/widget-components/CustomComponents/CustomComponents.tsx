import { CustomComponentType } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import FormCalculator from '@/src/components/segments/FormCalculator/FormCalculator'
import AccordionV2 from '@/src/components/simple-components/AccordionV2'
import Alert from '@/src/components/simple-components/Alert'
import Button from '@/src/components/simple-components/Button'

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
          <Button key={title} variant="link" href={href}>
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
