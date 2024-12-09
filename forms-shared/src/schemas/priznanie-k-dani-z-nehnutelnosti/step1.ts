import { createCamelCaseItemsV2 } from '../../generator/helpers'
import { number } from '../../generator/functions/number'
import { radioGroup } from '../../generator/functions/radioGroup'
import { step } from '../../generator/functions/step'

export default step('druhPriznania', { title: 'Druh priznania' }, [
  radioGroup(
    'druh',
    {
      type: 'string',
      title: 'Vyberte druh priznania',
      required: true,
      items: createCamelCaseItemsV2([
        {
          label: 'Priznanie',
          description: 'Označte, ak ste sa stali v Bratislave vlastníkom prvej nehnuteľnosti.',
        },
        {
          label: 'Čiastkové priznanie',
          description: 'Označte, ak ste v Bratislave už daňovníkom za inú nehnuteľnosť.',
        },
        {
          label: 'Čiastkové priznanie na zánik daňovej povinnosti.',
          description:
            'Označte, ak ste predali/darovali nehnuteľnosť v Bratislave (zaniklo vlastníctvo).',
        },
        {
          label: 'Opravné priznanie',
          description:
            'Označte v prípade, ak opravujete údaje v už podanom priznaní v lehote do 31. januára.',
        },
        {
          label: 'Dodatočné priznanie',
          description:
            'Označte, ak ste si v minulosti zabudli/neuviedli správne údaje v priznaní k dani z nehnuteľností najneskôr do štyroch rokov od konca roka, v ktorom vznikla povinnosť podať priznanie k dani z nehnuteľností.',
        },
      ]),
    },
    { variant: 'boxed', orientations: 'column' },
  ),
  number(
    'rok',
    {
      type: 'integer',
      title: 'Za aký rok podávate priznanie?',
      required: true,
      minimum: 2000,
      maximum: 2099,
    },
    {
      helptextFooter: `Kúpili ste alebo predali nehnuteľnosť v roku :tax-year? Zadajte rok :tax-year-next.`,
      helptextFooterMarkdown: true,
    },
  ),
])
