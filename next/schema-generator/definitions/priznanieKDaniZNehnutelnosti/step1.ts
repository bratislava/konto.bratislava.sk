import { numberField, radioButton, step } from '../../generator/functions'
import { createCamelCaseOptionsV2 } from '../../generator/helpers'

export default step('druhPriznania', { title: 'Druh priznania' }, [
  radioButton(
    'druh',
    {
      type: 'string',
      title: 'Vyberte druh priznania',
      required: true,
      // TODO description instead of tooltip
      options: createCamelCaseOptionsV2([
        {
          title: 'Priznanie',
          tooltip: 'Označte, ak ste sa stali v Bratislave vlastníkom prvej nehnuteľnosti',
        },
        {
          title: 'Čiastkové priznanie',
          tooltip: 'Označte, ak ste v Bratislave už daňovníkom za inú nehnuteľnosť',
        },
        {
          title: 'Čiastkové priznanie na zánik daňovej povinnosti',
          tooltip:
            'Označte, ak ste predali/darovali nehnuteľnosť v Bratislave (zaniklo vlastníctvo)',
        },
        {
          title: 'Opravné priznanie',
          tooltip:
            'Označte v prípade, ak opravujete údaje v už podanom priznaní v lehote do 31. januára.',
        },
        {
          title: 'Dodatočné priznanie',
          tooltip:
            'Označte, ak ste si v minulosti zabudli/neuviedli správne údaje v priznaní k dani z nehnuteľností najneskôr do štyroch rokov od konca roka, v ktorom vznikla povinnosť podať priznanie k dani z nehnuteľností.',
        },
      ]),
    },
    { variant: 'boxed', orientations: 'column' },
  ),
  numberField(
    'rok',
    {
      type: 'integer',
      title: 'Za aký rok podávate priznanie?',
      required: true,
      minimum: 2000,
      maximum: 2099,
    },
    // TODO make dynamic
    {
      placeholder: String(new Date().getFullYear() + 1),
      helptext: `Kúpili ste alebo predali nehnuteľnosť v roku ${new Date().getFullYear()}? Zadajte rok ${
        new Date().getFullYear() + 1
      }`,
      size: 'large',
    },
  ),
])
