import { WidgetSpacing } from 'forms-shared/generator/uiOptionsTypes'
import React, { createContext, PropsWithChildren, useContext } from 'react'

const WidgetSpacingContext = createContext<Partial<WidgetSpacing>>({})

export const WidgetSpacingContextProvider = ({
  children,
  spacing,
}: PropsWithChildren<{ spacing: Partial<WidgetSpacing> }>) => {
  return <WidgetSpacingContext.Provider value={spacing}>{children}</WidgetSpacingContext.Provider>
}

/**
 * Widget's default spacing should be different based on the context (if it's first, last, etc.), however the widgets
 * themselves don't know about the context, so it needs to be provided to them.
 */
export const useWidgetSpacingContext = () => {
  const context = useContext(WidgetSpacingContext)

  return context ?? {}
}
