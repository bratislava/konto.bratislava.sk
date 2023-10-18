import { WidgetProps } from '@rjsf/utils'
import { ComponentType, createContext, useContext } from 'react'

const FormWidgetContext = createContext<{ widget?: WidgetProps }>({
  widget: undefined,
})

/**
 * Provides an ability to access WidgetProps deep in the component tree.
 *
 * For example, PropertyTaxCalculator requires an ability to update the value of the widget that it
 * is used in.
 */
export const useFormWidget = () => {
  return useContext(FormWidgetContext)
}

/**
 * Wraps all the widgets into FormWidgetContext.
 */
export const wrapWidgetsInContext = <
  WidgetsObject extends Record<string, ComponentType<WidgetProps>>,
>(
  widgets: WidgetsObject,
): typeof widgets =>
  Object.fromEntries(
    Object.entries(widgets).map(
      ([key, Widget]) =>
        [
          key,
          (props) => (
            <FormWidgetContext.Provider value={{ widget: props }}>
              <Widget {...props} />
            </FormWidgetContext.Provider>
          ),
        ] as const,
    ),
  ) as WidgetsObject
