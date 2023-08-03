import { AccordionBase } from '../simple-components/Accordion'

export type FormSpacingType = 'large' | 'default' | 'small' | 'medium' | 'none'

export type WidgetOptions = {
  tooltip?: string
  helptext?: string
  // description prop is system prop that we need to be, we use helptext prop instead of description prop
  description?: string
  className?: string
  explicitOptional?: boolean
  accordion?: AccordionBase | AccordionBase[]
  spaceBottom?: FormSpacingType
  spaceTop?: FormSpacingType
}
