import { CSSProperties } from 'react'

export type CategoriesType =
  | 'main'
  | 'transport'
  | 'environment'
  | 'social'
  | 'education'
  | 'culture'

export const COLOR_VARIABLES: {
  [key: string]: {
    c800: string
    c700: string
    c600: string
    c500: string
    c400: string
    c300: string
    c200: string
    c100: string
  }
} = {
  main: {
    c800: '--color-main-800',
    c700: '--color-main-700',
    c600: '--color-main-600',
    c500: '--color-main-500',
    c400: '--color-main-400',
    c300: '--color-main-300',
    c200: '--color-main-200',
    c100: '--color-main-100',
  },
  transport: {
    c800: '--color-transport-800',
    c700: '--color-transport-700',
    c600: '--color-transport-600',
    c500: '--color-transport-500',
    c400: '--color-transport-400',
    c300: '--color-transport-300',
    c200: '--color-transport-200',
    c100: '--color-transport-100',
  },
  environment: {
    c800: '--color-environment-800',
    c700: '--color-environment-700',
    c600: '--color-environment-600',
    c500: '--color-environment-500',
    c400: '--color-environment-400',
    c300: '--color-environment-300',
    c200: '--color-environment-200',
    c100: '--color-environment-100',
  },
  social: {
    c800: '--color-social-800',
    c700: '--color-social-700',
    c600: '--color-social-600',
    c500: '--color-social-500',
    c400: '--color-social-400',
    c300: '--color-social-300',
    c200: '--color-social-200',
    c100: '--color-social-100',
  },
  education: {
    c800: '--color-education-800',
    c700: '--color-education-700',
    c600: '--color-education-600',
    c500: '--color-education-500',
    c400: '--color-education-400',
    c300: '--color-education-300',
    c200: '--color-education-200',
    c100: '--color-education-100',
  },
  culture: {
    c800: '--color-culture-800',
    c700: '--color-culture-700',
    c600: '--color-culture-600',
    c500: '--color-culture-500',
    c400: '--color-culture-400',
    c300: '--color-culture-300',
    c200: '--color-culture-200',
    c100: '--color-culture-100',
  },
}
// Return object with colors by category
const getColorsVariables = (pageCategory: string) =>
  COLOR_VARIABLES[pageCategory] ?? COLOR_VARIABLES.main

// We get colors from the server and we need to transorm it to category.
// Function which get color (red, blue, green...) and tranform it to category (main, transport, environment ...)
export const transformColorToCategory = (pageColor: string): string => {
  let category: string
  switch (pageColor) {
    case 'red':
      category = 'main'
      break
    case 'blue':
      category = 'transport'
      break
    case 'green':
      category = 'environment'
      break
    case 'yellow':
      category = 'social'
      break
    case 'purple':
      category = 'education'
      break
    case 'brown':
      category = 'culture'
      break

    default:
      category = pageColor
      break
  }
  return category
}

declare module 'react' {
  interface CSSProperties {
    '--color-category-800'?: string
    '--color-category-700'?: string
    '--color-category-600'?: string
    '--color-category-500'?: string
    '--color-category-400'?: string
    '--color-category-300'?: string
    '--color-category-200'?: string
    '--color-category-100'?: string
  }
}

export const pageStyle = (pageColor: string) => {
  const category = transformColorToCategory(pageColor)
  const color = getColorsVariables(category)

  return {
    '--color-category-800': `var(${color.c800})`,
    '--color-category-700': `var(${color.c700})`,
    '--color-category-600': `var(${color.c600})`,
    '--color-category-500': `var(${color.c500})`,
    '--color-category-400': `var(${color.c400})`,
    '--color-category-300': `var(${color.c300})`,
    '--color-category-200': `var(${color.c200})`,
    '--color-category-100': `var(${color.c100})`,
  } satisfies CSSProperties
}
