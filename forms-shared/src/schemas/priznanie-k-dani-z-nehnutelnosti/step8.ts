import { checkboxGroup, step, textArea } from '../../generator/functions'

export default step(
  'znizenieAleboOslobodenieOdDane',
  { title: 'Zníženie alebo oslobodenie od dane' },
  [
    checkboxGroup(
      'pozemky',
      {
        title: 'Pozemky',
        options: [
          {
            value: 'option1',
            label: 'pozemky, na ktorých sú cintoríny, kolumbáriá, urnové háje a rozptylové lúky',
          },
          {
            value: 'option2',
            label: 'pásma hygienickej ochrany vodných zdrojov I. stupňa a II. stupňa',
          },
          {
            value: 'option3',
            label: 'pozemky verejne prístupných parkov a verejne prístupných športovísk',
          },
          {
            value: 'option4',
            label:
              'pozemky, ktorých vlastníkmi sú fyzické osoby staršie ako 65 rokov, ak tieto pozemky slúžia výhradne na ich osobnú potrebu',
          },
        ],
      },
      { variant: 'boxed', labelSize: 'h3' },
    ),
    checkboxGroup(
      'stavby',
      {
        title: 'Stavby',
        options: [
          {
            value: 'option1',
            label: 'stavby slúžiace detským domovom',
          },
          {
            value: 'option2',
            label:
              'stavby na bývanie vo vlastníctve fyzických osôb starších ako 65 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ako aj prevažne alebo úplne bezvládnych fyzických osôb, ktoré slúžia na ich trvalé bývanie',
          },
          {
            value: 'option3',
            label:
              'garáže v bytových domoch slúžiace ako garáž vo vlastníctve držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ktoré slúžia pre motorové vozidlo používané na ich dopravu',
          },
        ],
      },
      { variant: 'boxed', labelSize: 'h3' },
    ),
    checkboxGroup(
      'byty',
      {
        title: 'Byty',
        options: [
          {
            value: 'option1',
            label:
              'byty vo vlastníctve fyzických osôb starších ako 65 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ako aj prevažne alebo úplne bezvládnych fyzických osôb, ktoré slúžia na ich trvalé bývanie',
          },
          {
            value: 'option2',
            label:
              'nebytové priestory v bytových domoch slúžiace ako garáž vo vlastníctve držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ktoré slúžia pre motorové vozidlo používané na ich dopravu',
          },
        ],
      },
      { variant: 'boxed', labelSize: 'h3' },
    ),
    textArea(
      'poznamka',
      { title: 'Poznámka' },
      { placeholder: 'Tu môžete napísať doplnkové informácie' },
    ),
  ],
)
