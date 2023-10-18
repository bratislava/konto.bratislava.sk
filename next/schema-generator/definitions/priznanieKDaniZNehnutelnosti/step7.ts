import { checkboxes, step } from '../../generator/functions'

export default step(
  'znizenieAleboOslobodenieOdDane',
  { title: 'Zníženie alebo oslobodenie od dane' },
  [
    checkboxes(
      'pozemky',
      {
        title: 'Pozemky',
        options: [
          {
            value: 'option1',
            title: 'pozemky, na ktorých sú cintoríny, kolumbáriá, urnové háje a rozptylové lúky',
          },
          {
            value: 'option2',
            title:
              'močiare, plochy slatín a slancov, rašeliniská, remízky, háje, vetrolamy a pásma hygienickej ochrany vodných zdrojov I. stupňa a II. stupňa, pásma ochrany prírodných liečivých zdrojov I. stupňa a II. stupňa a zdrojov prírodných minerálnych vôd stolových I. stupňa a II. stupňa',
          },
          {
            value: 'option3',
            title: 'pozemky verejne prístupných parkov, priestorov a športovísk',
          },
          {
            value: 'option4',
            title:
              'pozemky, ktorých vlastníkmi sú fyzické osoby v hmotnej núdzi alebo fyzické osoby staršie ako 62 rokov, ak tieto pozemky slúžia výhradne na ich osobnú potrebu',
          },
        ],
      },
      { variant: 'boxed' },
    ),
    checkboxes(
      'stavby',
      {
        title: 'Stavby',
        options: [
          {
            value: 'option1',
            title:
              'stavby slúžiace školám, školským zariadeniam a zdravotníckym zariadeniam, zariadeniam na pracovnú rehabilitáciu a rekvalifikáciu občanov so zmenenou pracovnou schopnosťou, stavby užívané na účely sociálnej pomoci a múzeá, galérie, knižnice, divadlá, kiná, amfiteátre, výstavné siene, osvetové zariadenia',
          },
          {
            value: 'option2',
            title:
              'stavby na bývanie vo vlastníctve fyzických osôb v hmotnej núdzi, fyzických osôb starších ako 65 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ako aj prevažne alebo úplne bezvládnych fyzických osôb, ktoré slúžia na ich trvalé bývanie',
          },
          {
            value: 'option3',
            title:
              'garáže vo vlastníctve fyzických osôb starších ako 62 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ktoré slúžia pre motorové vozidlo používané na ich dopravu',
          },
        ],
      },
      { variant: 'boxed' },
    ),
    checkboxes(
      'byty',
      {
        title: 'Byty',
        options: [
          {
            value: 'option1',
            title:
              'byty vo vlastníctve fyzických osôb v hmotnej núdzi, fyzických osôb starších ako 62 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ako aj prevažne alebo úplne bezvládnych fyzických osôb, ktoré slúžia na ich trvalé bývanie',
          },
          {
            value: 'option2',
            title:
              'nebytové priestory v bytových domoch slúžiace ako garáž vo vlastníctve fyzických osôb starších ako 62 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ktoré slúžia pre motorové vozidlo používané na ich dopravu',
          },
        ],
      },
      { variant: 'boxed' },
    ),
  ],
)
