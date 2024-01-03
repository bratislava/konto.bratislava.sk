import { markdownText, number, radioGroup, step } from '../../generator/functions'
import { createCamelCaseOptionsV2 } from '../../generator/helpers'

export default step('druhPriznania', { title: 'Druh priznania' }, [
  radioGroup(
    'druh',
    {
      type: 'string',
      title: 'Vyberte druh priznania',
      required: true,
      options: createCamelCaseOptionsV2([
        {
          title: 'Priznanie',
          description: 'Označte, ak ste sa stali v Bratislave vlastníkom prvej nehnuteľnosti.',
        },
        {
          title: 'Čiastkové priznanie',
          description: 'Označte, ak ste v Bratislave už daňovníkom za inú nehnuteľnosť.',
        },
        {
          title: 'Čiastkové priznanie na zánik daňovej povinnosti.',
          description:
            'Označte, ak ste predali/darovali nehnuteľnosť v Bratislave (zaniklo vlastníctvo).',
        },
        {
          title: 'Opravné priznanie',
          description:
            'Označte v prípade, ak opravujete údaje v už podanom priznaní v lehote do 31. januára.',
        },
        {
          title: 'Dodatočné priznanie',
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
      helptext: markdownText(
        `Kúpili ste alebo predali nehnuteľnosť v roku :tax-year? Zadajte rok :tax-year-next.`,
      ),
    },
  ),
])
