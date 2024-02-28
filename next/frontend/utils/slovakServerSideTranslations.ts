import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tail<T extends any[]> = ((...t: T) => any) extends (_: any, ...tail: infer U) => any ? U : []

/**
 * No need to extract "sk" locale from server context every time, if more languages are added, this function will be
 * deleted.
 */
export const slovakServerSideTranslations = (
  ...args: Tail<Parameters<typeof serverSideTranslations>>
) => serverSideTranslations('sk', ...args)
