import { createCondition, createStringItems } from '../../generator/helpers'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { datePicker } from '../../generator/functions/datePicker'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { conditionalFields } from '../../generator/functions/conditionalFields'
import { schema } from '../../generator/functions/schema'
import { fileUploadMultiple } from '../../generator/functions/fileUploadMultiple'

export default schema({ title: 'TEST - Umiestnenie zariadenia' }, {}, [
  step('ziadatel', { title: 'Žiadateľ' }, [
    radioGroup(
      'objednavatelAko',
      {
        type: 'string',
        title: 'Objednávateľ ako',
        required: true,
        items: createStringItems([
          'Fyzická osoba',
          'Fyzická osoba - podnikateľ',
          'Právnická osoba',
        ]),
      },
      { variant: 'boxed', orientations: 'column' },
    ),
    conditionalFields(
      createCondition([
        [
          ['objednavatelTyp'],
          {
            enum: ['Fyzická osoba', 'Fyzická osoba - podnikateľ'],
          },
        ],
      ]),
      [
        object('menoPriezvisko', { required: true }, {}, [
          input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
          input(
            'priezvisko',
            { title: 'Priezvisko', required: true, type: 'text' },
            { selfColumn: '2/4' },
          ),
        ]),
      ],
    ),
    conditionalFields(
      createCondition([
        [
          ['objednavatelTyp'],
          {
            enum: ['Fyzická osoba - podnikateľ', 'Právnická osoba'],
          },
        ],
      ]),
      [
        input('obchodneMeno', { title: 'Obchodné meno', required: true, type: 'text' }, {}),
        input('ico', { title: 'IČO', required: true, type: 'text' }, {}),
        input('dic', { title: 'DIČ', required: true, type: 'text' }, {}),
        input('icDph', { title: 'IČ DPH', required: true, type: 'text' }, {}),
      ],
    ),
    conditionalFields(
      createCondition([
        [
          ['objednavatelTyp'],
          {
            const: 'Fyzická osoba',
          },
        ],
      ]),
      [
        input(
          'adresaTrvalehoPobytu',
          { title: 'Adresa trvalého pobytu', required: true, type: 'text' },
          { helptext: 'Vyplňte vo formáte ulica a číslo' },
        ),
      ],
    ),
    conditionalFields(
      createCondition([
        [
          ['objednavatelTyp'],
          {
            const: 'Fyzická osoba - podnikateľ',
          },
        ],
      ]),
      [
        input(
          'adresaPodnikania',
          { title: 'Miesto podnikania', required: true, type: 'text' },
          { helptext: 'Vyplňte vo formáte ulica a číslo' },
        ),
      ],
    ),
    conditionalFields(
      createCondition([
        [
          ['objednavatelTyp'],
          {
            const: 'Právnická osoba',
          },
        ],
      ]),
      [
        input(
          'adresaSidla',
          { title: 'Adresa sídla', required: true, type: 'text' },
          { helptext: 'Vyplňte vo formáte ulica a číslo' },
        ),
      ],
    ),
    object('mestoPsc', { required: true }, {}, [
      input('mesto', { type: 'text', title: 'Mesto', required: true }, { selfColumn: '3/4' }),
      input('psc', { type: 'ba-slovak-zip', title: 'PSČ', required: true }, { selfColumn: '1/4' }),
    ]),
    input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    input(
      'telefonneCislo',
      { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
      { helptext: 'Vyplňte vo formáte +421' },
    ),
    conditionalFields(createCondition([[['objednavatelTyp'], { const: 'Právnická osoba' }]]), [
      object(
        'kontaktnaOsoba',
        { required: true },
        { objectDisplay: 'boxed', title: 'Kontaktná osoba' },
        [
          input('meno', { title: 'Meno', required: true, type: 'text' }, { helptext: 'Meno' }),
          input(
            'priezvisko',
            { title: 'Priezvisko', required: true, type: 'text' },
            { helptext: 'Priezvisko' },
          ),
          input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
          input(
            'telefonneCislo',
            { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
            { helptext: 'Vyplňte vo formáte +421' },
          ),
        ],
      ),
    ]),
  ]),
  step('informacieOZariadeni', { title: 'Informácie o zariadení' }, [
    fileUploadMultiple(
      'umiestnenieStoziare',
      {
        title:
          'Nahrajte vyplnený súbor Umiestnenie zariadení na stožiare verejného osvetlenia.xlsx',
        required: true,
      },
      {
        type: 'dragAndDrop',
        helptext:
          'V prípade, že požadovaný súbor na vyplnenie ešte nemáte, stiahnuť si ho viete na tomto odkaze. Dbajte na to, aby ste v súbore spomenuli všetky zariadenia, ktoré si želáte umiestniť. Bez vyplnenia a nahratia tohto súboru nebude možné vašu žiadosť spracovať.',
      },
    ),
    radioGroup(
      'zodpovednostZaMontaz',
      {
        type: 'string',
        title: 'Za montáž, prevádzku a demontáž zodpovedá',
        required: true,
        items: createStringItems(['Organizácia', 'Fyzická osoba']),
      },
      { variant: 'boxed', orientations: 'column' },
    ),
    conditionalFields(createCondition([[['zodpovednostZaMontaz'], { const: 'Organizácia' }]]), [
      input('nazovOrganizacie', { type: 'text', title: 'Názov organizácie', required: true }, {}),
      object(
        'kontaktnaOsoba',
        { required: true },
        { objectDisplay: 'boxed', title: 'Kontaktná osoba' },
        [
          object('menoPriezvisko', { required: true }, {}, [
            input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
            input(
              'priezvisko',
              { title: 'Priezvisko', required: true, type: 'text' },
              { selfColumn: '2/4' },
            ),
          ]),
        ],
      ),
    ]),
    conditionalFields(createCondition([[['zodpovednostZaMontaz'], { const: 'Fyzická osoba' }]]), [
      object('menoPriezvisko', { required: true }, {}, [
        input('meno', { title: 'Meno', required: true, type: 'text' }, { selfColumn: '2/4' }),
        input(
          'priezvisko',
          { title: 'Priezvisko', required: true, type: 'text' },
          { selfColumn: '2/4' },
        ),
      ]),
    ]),
    input('email', { title: 'E-mail', required: true, type: 'email' }, {}),
    input(
      'telefonneCislo',
      { title: 'Telefónne číslo', required: true, type: 'ba-phone-number' },
      { helptext: 'Vyplňte vo formáte +421' },
    ),
    datePicker(
      'planovanyDatumMontaze',
      {
        title: 'Plánovaný dátum montáže zariadenia',
        required: true,
      },
      {
        helptext:
          'O zahájení prác je potrebné písomne informovať minimálne 1 pracovný deň vopred prostredníctvom e-mailu na info@tsb.sk.',
      },
    ),
    datePicker(
      'planovanyDatumDemontaze',
      {
        title: 'Plánovaný dátum demontáže zariadenia',
        required: true,
      },
      {
        helptext:
          'Žiadateľ je povinný na základe písomnej výzvy zabezpečiť demontáž svojho zariadenia na vlastné náklady, a to v lehote najneskôr do 15 kalendárnych dní od doručenia takejto výzvy prostredníctvom kontaktného e-mailu.',
      },
    ),
  ]),
  step('prilohy', { title: 'Prílohy' }, [
    fileUploadMultiple(
      'fotografiaVizualizacia',
      {
        title: 'Fotografia alebo vizualizácia zariadenia/zariadení',
        required: true,
      },
      {
        type: 'dragAndDrop',
        helptext:
          'Nahrajte jednu prílohu obsahujúcu fotografie alebo vizualizácie všetkých zariadení.',
      },
    ),
  ]),
])
