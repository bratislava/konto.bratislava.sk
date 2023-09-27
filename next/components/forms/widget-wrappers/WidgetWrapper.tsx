import cx from 'classnames'
import Button from 'components/forms/simple-components/ButtonNew'
import { FormSpacingType } from 'components/forms/types/WidgetOptions'
import React, { ReactNode, useId } from 'react'

import { isObject } from '../../../frontend/utils/general'
import Accordion, { AccordionBase } from '../simple-components/Accordion'

type WidgetWrapperBase = {
  children: ReactNode
  className?: string
  spaceBottom?: FormSpacingType
  spaceTop?: FormSpacingType
  accordion?: AccordionBase | AccordionBase[]
  additionalLinks?: Array<{ title: string; href: string }>
  id?: string
}

export const isFormSpacingType = (formSpacingType: string): formSpacingType is FormSpacingType => {
  return ['large', 'default', 'small', 'medium', 'none'].includes(formSpacingType)
}

const WidgetWrapper = ({
  children,
  className,
  accordion,
  spaceBottom = 'default',
  spaceTop = 'default',
  id,
  additionalLinks,
}: WidgetWrapperBase) => {
  const generatedId = useId()
  const generatedOrProvidedId = id ?? generatedId

  return (
    <div
      className={cx('flex flex-col gap-4', className, {
        'mb-0': spaceBottom === 'none',
        'mb-10': spaceBottom === 'large',
        'mb-8': spaceBottom === 'medium',
        'mb-6': spaceBottom === 'small',
        'mb-4': spaceBottom === 'default',

        'mt-0': spaceTop === 'none',
        'mt-10': spaceTop === 'large',
        'mt-8': spaceTop === 'medium',
        'mt-6': spaceTop === 'small',
        'mt-4': spaceTop === 'default',
      })}
    >
      {children}
      {Array.isArray(accordion) &&
        accordion.map((item, index) => {
          const labelId = `${generatedOrProvidedId}-item-label-${index}`
          return (
            <Accordion
              key={labelId}
              size={item.size}
              title={item.title}
              shadow={item.shadow}
              content={item.content}
            />
          )
        })}
      {isObject(accordion) && (
        <Accordion
          size={(accordion as AccordionBase)?.size}
          title={(accordion as AccordionBase)?.title}
          shadow={(accordion as AccordionBase)?.shadow}
          content={(accordion as AccordionBase)?.content}
        />
      )}
      {additionalLinks && (
          <div className="flex flex-col gap-2">
            {additionalLinks?.map(({ title, href }) => (
              <Button key={title} variant="category-link" href={href} hasLinkIcon>
                {title}
              </Button>
            ))}
          </div>
        )}
    </div>
  )
}

export default WidgetWrapper
