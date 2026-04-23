// cn helper function inspired by https://ui.shadcn.com/docs/installation/manual
import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const baTwMerge = extendTailwindMerge({
  extend: {
    // Add custom theme values
    theme: {
      // Custom breakpoints
      breakpoint: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],

      // Custom colors
      color: [
        // Main colors
        'main-800',
        'main-700',
        'main-600',
        'main-500',
        'main-400',
        'main-300',
        'main-200',
        'main-100',
        // Transport colors
        'transport-800',
        'transport-700',
        'transport-600',
        'transport-500',
        'transport-400',
        'transport-300',
        'transport-200',
        'transport-100',
        // Environment colors
        'environment-800',
        'environment-700',
        'environment-600',
        'environment-500',
        'environment-400',
        'environment-300',
        'environment-200',
        'environment-100',
        // Social colors
        'social-800',
        'social-700',
        'social-600',
        'social-500',
        'social-400',
        'social-300',
        'social-200',
        'social-100',
        // Education colors
        'education-800',
        'education-700',
        'education-600',
        'education-500',
        'education-400',
        'education-300',
        'education-200',
        'education-100',
        // Culture colors
        'culture-800',
        'culture-700',
        'culture-600',
        'culture-500',
        'culture-400',
        'culture-300',
        'culture-200',
        'culture-100',
        // Gray colors - TODO remove with gray/grey consolidation
        'gray-800',
        'gray-700',
        'gray-600',
        'gray-500',
        'gray-400',
        'gray-300',
        'gray-200',
        'gray-100',
        'gray-50',
        'gray-0',
        // Grey colors
        'grey-800',
        'grey-700',
        'grey-600',
        'grey-500',
        'grey-400',
        'grey-300',
        'grey-200',
        'grey-100',
        'grey-50',
        'grey-0',
        // Success colors
        'success-800',
        'success-700',
        'success-600',
        'success-500',
        'success-400',
        'success-300',
        'success-200',
        'success-100',
        'success-50',
        // Negative colors
        'negative-800',
        'negative-700',
        'negative-600',
        'negative-500',
        'negative-400',
        'negative-300',
        'negative-200',
        'negative-100',
        'negative-50',
        // Warning colors
        'warning-800',
        'warning-700',
        'warning-600',
        'warning-500',
        'warning-400',
        'warning-300',
        'warning-200',
        'warning-100',
        'warning-50',
        // Category colors
        'category-800',
        'category-700',
        'category-600',
        'category-500',
        'category-400',
        'category-300',
        'category-200',
        'category-100',
        // Municipal services colors
        'municipal-services-tsb',
        'municipal-services-tsb-bg',
        'municipal-services-olo',
        'municipal-services-olo-bg',
        'municipal-services-marianum',
        'municipal-services-marianum-bg',
        // Other colors
        'error',
        'font',
        'font-contrast',
      ],

      // Custom shadows
      shadow: ['lg', 'md', 'default', 'sm'],

      // Custom animations
      animate: ['stepper-slide', 'stepper-slide-reverse'],
    },
    classGroups: {
      // Keep in sync with utility classes in globals.css
      'font-size': [
        'text-size-h1-hero',
        'text-size-h1-hero-r',
        'text-size-h1',
        'text-size-h1-r',
        'text-size-h2',
        'text-size-h2-r',
        'text-size-h3',
        'text-size-h3-r',
        'text-size-h4',
        'text-size-h4-r',
        'text-size-h5',
        'text-size-h5-r',
        'text-size-h6',
        'text-size-h6-r',
        'text-size-p-large',
        'text-size-p-large-r',
        'text-size-p-default',
        'text-size-p-default-r',
        'text-size-p-small',
        'text-size-p-small-r',
        'text-size-p-tiny',
        'text-size-p-tiny-r',
        'text-size-button-large',
        'text-size-button-large-r',
        'text-size-button-default',
        'text-size-button-default-r',
      ],
    },
  },
})

const cn = (...args: ClassValue[]) => {
  return baTwMerge(clsx(args))
}

export default cn
