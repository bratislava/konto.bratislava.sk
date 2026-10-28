/**
 * What a form calls what the user sent. The form decides (an OLO order is "objednávka", a city
 * request "žiadosť"); emails inflect it. All three nouns are feminine, so the possessive and the
 * verb agree the same way: "Vaša žiadosť bola odoslaná", "Vaša objednávka bola odoslaná".
 */
export type RequestNoun = 'ziadost' | 'poziadavka' | 'objednavka'

type NounForms = {
  /** "Vaša žiadosť bola odoslaná" */
  nominative: string
  /** "sumár odoslanej žiadosti" */
  genitive: string
  /** "Vašu žiadosť nájdete" */
  accusative: string
}

export const requestNounForms: Record<RequestNoun, NounForms> = {
  ziadost: { nominative: 'žiadosť', genitive: 'žiadosti', accusative: 'žiadosť' },
  poziadavka: { nominative: 'požiadavka', genitive: 'požiadavky', accusative: 'požiadavku' },
  objednavka: { nominative: 'objednávka', genitive: 'objednávky', accusative: 'objednávku' },
}
