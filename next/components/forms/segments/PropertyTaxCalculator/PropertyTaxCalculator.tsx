import { CopyIcon } from '@assets/ui-icons'
import { GenericObjectType } from '@rjsf/utils'
import { Parser } from 'expr-eval'
import React, { useMemo, useState } from 'react'
import { CustomComponentPropertyCalculatorProps } from 'schema-generator/generator/uiOptionsTypes'

import { rjsfValidator } from '../../../../frontend/utils/form'
import ButtonNew from '../../simple-components/ButtonNew'
import ModalV2 from '../../simple-components/ModalV2'
import { useFormComponent } from '../../useFormComponent'
import { useFormWidget } from '../../useFormWidget'

const PropertyTaxCalculator = ({
  title,
  openButtonLabel,
  buttonLabel,
  valueLabel,
  form,
  formula,
}: CustomComponentPropertyCalculatorProps) => {
  const FormComponent = useFormComponent()
  const { widget } = useFormWidget()

  const expression = useMemo(() => {
    const parser = new Parser()

    // Ratio (e.g. "5/13") is a string that needs to be evaluated.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    parser.functions.evalRatio = (arg: string) => parser.evaluate(arg)

    return parser.parse(formula)
  }, [formula])

  const [formData, setFormData] = useState<GenericObjectType | undefined>({})

  const [isModalOpen, setIsModalOpen] = useState(false)

  const value = useMemo(() => {
    const isValid = rjsfValidator.isValid(form.schema, formData, form.schema)
    if (!isValid || !formData) {
      return null
    }

    try {
      const evaluated = expression.evaluate(formData)

      if (!Number.isFinite(evaluated)) {
        return null
      }

      return evaluated as number
    } catch (error) {
      return null
    }
  }, [form.schema, formData, expression])

  const handleOnConfirm = () => {
    if (value != null) {
      widget?.onChange(value)
    }

    setIsModalOpen(false)
  }

  return (
    <>
      <ButtonNew variant="black-link" onPress={() => setIsModalOpen(true)} hasLinkIcon>
        {openButtonLabel}
      </ButtonNew>
      <ModalV2 isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        {title}
        <FormComponent
          schema={form.schema}
          uiSchema={form.uiSchema}
          formData={formData}
          validator={rjsfValidator}
          onChange={(e) => {
            setFormData(e.formData)
          }}
          showErrorList={false}
          // HTML validation doesn't work for our use case, therefore it's turned off.
          noHtml5Validate
        >
          {/* This hides the default submit button. */}
          {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
          <></>
        </FormComponent>
        {valueLabel}
        {value}
        <ButtonNew variant="black-solid" startIcon={<CopyIcon />} onPress={handleOnConfirm}>
          {buttonLabel}
        </ButtonNew>
      </ModalV2>
    </>
  )
}

export default PropertyTaxCalculator
