import { Button, Typography } from '@bratislava/component-library'
import { CustomComponentType } from 'forms-shared/generator/uiOptionsTypes'

import Markdown from '@/src/components/formatting/Markdown'
import FormCalculator from '@/src/components/segments/FormCalculator/FormCalculator'
import Alert from '@/src/components/simple-components/Alert'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'

const CustomComponent = ({ id, component }: { id: string; component: CustomComponentType }) => {
  if (component.type === 'accordion') {
    return (
      <DisclosureGroup className="rounded-lg border border-border-active-default bg-background-passive-base py-2">
        <Disclosure id={`disclosure-${id}`}>
          <DisclosureHeader className="p-4 ring-inset lg:px-6">
            <Typography variant="h4" as="h3">
              {component.props?.title}
            </Typography>
          </DisclosureHeader>

          <DisclosurePanel className="px-4 lg:px-6">
            <Markdown variant="accordion" content={component.props?.content} />
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
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
