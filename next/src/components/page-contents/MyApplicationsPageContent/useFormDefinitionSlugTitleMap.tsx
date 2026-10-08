import { createContext, PropsWithChildren, useContext } from 'react'

/**
 * Maps a form definition slug to its title. It is built on the server, so the whole
 * `formDefinitions` bundle doesn't have to be shipped to the client.
 */
export type FormDefinitionSlugTitleMap = Record<string, string>

type FormDefinitionSlugTitleMapProviderProps = {
  formDefinitionSlugTitleMap: FormDefinitionSlugTitleMap
}

const FormDefinitionSlugTitleMapContext = createContext<FormDefinitionSlugTitleMap | undefined>(
  undefined,
)

export const FormDefinitionSlugTitleMapProvider = ({
  formDefinitionSlugTitleMap,
  children,
}: PropsWithChildren<FormDefinitionSlugTitleMapProviderProps>) => (
  <FormDefinitionSlugTitleMapContext.Provider value={formDefinitionSlugTitleMap}>
    {children}
  </FormDefinitionSlugTitleMapContext.Provider>
)

export const useFormDefinitionSlugTitleMap = () => {
  const context = useContext(FormDefinitionSlugTitleMapContext)
  if (!context) {
    throw new Error(
      'useFormDefinitionSlugTitleMap must be used within a FormDefinitionSlugTitleMapProvider',
    )
  }

  return context
}
