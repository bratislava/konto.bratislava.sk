import { ThemeProps, withTheme } from '@rjsf/core'
import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  GenericObjectType,
  getTemplate,
  getUiOptions,
  ObjectFieldTemplateProps,
} from '@rjsf/utils'
import cx from 'classnames'
import { ComponentType, Fragment } from 'react'
import { ArrayFieldUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import { getArrayFieldItemTemplateTitle } from '../../../../frontend/utils/formArray'
import SummaryWidgetRJSF, { SummaryWidgetRJSFProps, SummaryWidgetType } from './SummaryWidgetRJSF'

const wrapWidget = (widgetType: SummaryWidgetType) =>
  function wrap(props: Omit<SummaryWidgetRJSFProps, 'widgetType'>) {
    return <SummaryWidgetRJSF {...props} widgetType={widgetType} />
  }

const ObjectFieldTemplate = ({ title, properties, idSchema }: ObjectFieldTemplateProps) => {
  const splitId = idSchema.$id.split('_')
  const isStepObject = splitId.length === 2 && splitId[0] === 'root'

  return (
    <div className={cx({ 'mb-4': isStepObject })}>
      {isStepObject && <h2 className="text-h3-bold mb-2">{title}</h2>}
      {properties.map((element, index) => (
        <Fragment key={index}>{element.content}</Fragment>
      ))}
    </div>
  )
}

const ArrayFieldItemTemplate = ({
  index,
  children,
  parentUiOptions,
}: ArrayFieldTemplateItemType & {
  parentUiOptions: ArrayFieldUiOptions
}) => {
  const { itemTitle } = parentUiOptions
  const title = getArrayFieldItemTemplateTitle(itemTitle, index)

  return (
    <div className="mb-4">
      {title && <h4 className="text-h5-bold mb-2">{title}</h4>}
      {children}
    </div>
  )
}

const ArrayFieldTemplate = ({ title, items, registry, uiSchema }: ArrayFieldTemplateProps) => {
  const uiOptions = getUiOptions(uiSchema) as ArrayFieldUiOptions
  const InnerArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate'>(
    'ArrayFieldItemTemplate',
    registry,
  ) as ComponentType<ArrayFieldTemplateItemType & { parentUiOptions: ArrayFieldUiOptions }>

  return (
    <div className="mt-4">
      {title && <h3 className="text-h4-bold mb-2">{title}</h3>}
      {items &&
        items.map(({ key, ...itemProps }) => (
          <InnerArrayFieldItemTemplate key={key} {...itemProps} parentUiOptions={uiOptions} />
        ))}
    </div>
  )
}

const theme: ThemeProps = {
  templates: {
    ObjectFieldTemplate,
    // It contains extra parentUiOptions prop that is not present in the original ArrayFieldItemTemplate, so we need to
    // cast it to the original type
    ArrayFieldItemTemplate: ArrayFieldItemTemplate as ComponentType<ArrayFieldTemplateItemType>,
    ArrayFieldTemplate,
  },
  widgets: {
    Select: wrapWidget('select'),
    Input: wrapWidget('input'),
    RadioGroup: wrapWidget('radioGroup'),
    TextArea: wrapWidget('textArea'),
    CheckboxGroup: wrapWidget('checkboxGroup'),
    FileUpload: wrapWidget('fileUpload'),
    DatePicker: wrapWidget('datePicker'),
    TimePicker: wrapWidget('timePicker'),
    CustomComponents: () => {
      return null
    },
  },
}

/**
 * Parsing the form values and their respective fields is non-trivial. To make this easier and consistent with the rest
 * of the form behaviour we use the RJSF to render the form, but the provided fields and widgets are replaced with
 * custom ones that only display the values and are not able to edit the form values.
 */
const SummaryForm = withTheme<GenericObjectType>(theme)

export default SummaryForm
