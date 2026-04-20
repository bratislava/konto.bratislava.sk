/**
 * Based on Bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/master/next/src/components/cards/getCardTitleLevel.ts
 */

export type SectionTitleLevel = 'h2' | 'h3'

export type CardTitleLevel = 'h3' | 'h4'

export type AccordionTitleLevel = 'h2' | 'h3' | 'h4'

export const getCardTitleLevel = (
  sectionTitleLevel: SectionTitleLevel | null | undefined,
): CardTitleLevel => {
  if (sectionTitleLevel === 'h3') return 'h4'

  return 'h3'
}
