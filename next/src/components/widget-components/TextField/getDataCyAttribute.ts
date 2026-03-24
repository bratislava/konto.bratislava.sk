import slugify from '@sindresorhus/slugify'

type FieldType = 'text' | 'radio-group'

export const getDataCyAttribute = (fieldType: FieldType, name: string | null | undefined) => {
  return name ? `${fieldType}-${slugify(name.replaceAll(/[(),./?§]/g, ''))}` : undefined
}
