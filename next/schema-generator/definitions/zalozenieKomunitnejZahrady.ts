import {
  conditionalFields,
  fileUpload,
  input,
  markdownText,
  radioGroup,
  schema,
  select,
  step,
} from '../generator/functions'
import { createCondition } from '../generator/helpers'

export default schema(
  {
    title: 'Založenie komunitnej záhrady',
    pospID: '',
    pospVersion: '0.1',
  },
  {},
  [
    step('oVas', { title: 'O vás' }, [
      input('menoAPriezvisko', { title: 'Meno a priezvisko', required: true, type: 'text' }, {}),
      input('adresa', { title: 'Vaša Adresa', required: true, type: 'text' }, {}),
      input('email', { title: 'Email', required: true, type: 'email' }, {}),
      input(
        'telefon',
        { title: 'Telefónne číslo (v tvare +421...)', required: true, type: 'tel' },
        {},
      ),
    ]),

    step('oObcianskomZdruzeni', { title: 'O občianskom združení' }, [
      input('nazovSubjektu', { title: 'Názov subjektu', required: true, type: 'text' }, {}),
      input('ico', { title: 'IČO', required: true, type: 'text' }, {}),
      input('adresaSidla', { title: 'Adresa sídla', required: true, type: 'text' }, {}),
      input('menoStatutara', { title: 'Meno štatutára', required: true, type: 'text' }, {}),
    ]),

    step(
      'pozemokAZahrada',
      {
        title: 'Pozemok a Záhrada',
        description:
          'Odporúčame Vám výber jedného z mestských pozemkov. V prípade, že chcete navrhnúť iný pozemok, vlastník pozemku musí schváliť umiestnenie záhrady, čo môže predĺžiť čas spracovania Vašej žiadosti.',
      },
      [
        radioGroup(
          'typPozemku',
          {
            type: 'string',
            title: 'O aký pozemok máte záujem?',
            required: true,
            options: [
              { value: 'mestsky', title: 'Mestský pozemok z ponuky', isDefault: true },
              { value: 'vlastny', title: 'Vlastný pozemok' },
            ],
          },
          {
            variant: 'boxed',
            orientations: 'column',
          },
        ),
        conditionalFields(createCondition([[['typPozemku'], { const: 'mestsky' }]]), [
          select(
            'mestskyPozemok',
            {
              title: 'Mestský pozemok, o ktorý máte záujem',
              required: true,
              options: [
                { value: '1', title: 'Pri Kríži' },
                { value: '2', title: 'Haburská A' },
                { value: '3', title: 'Haburská B' },
                { value: '4', title: 'Staré záhrady' },
                { value: '5', title: 'Líščie údolie' },
                { value: '6', title: 'Azalková' },
                { value: '7', title: 'Tokajícka' },
                { value: '8', title: 'Vyšehradská' },
                { value: '9', title: 'Budatínska A' },
                { value: '10', title: 'Budatínska B' },
                { value: '11', title: 'Machová' },
                { value: '12', title: 'Medzijárky' },
                { value: '13', title: 'Nejedlého' },
                { value: '14', title: 'Štefunkova' },
              ],
            },
            { dropdownDivider: true },
          ),
        ]),
        conditionalFields(createCondition([[['typPozemku'], { const: 'vlastny' }]]), [
          input(
            'vlastnyPozemok',
            {
              title: 'Adresa a parcelné číslo vlastného pozemku',
              type: 'text',
              required: true,
            },
            {
              helptextHeader: markdownText(
                'Na vyhľadanie parcelného čísla môžete využiť portál [ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster)',
              ),
            },
          ),
        ]),
        input(
          'suhlasKomunity',
          { title: 'Máte súhlas miestnej komunity?', type: 'text', required: true },
          {
            placeholder: 'Popíšte nám ho',
            helptextHeader:
              'Dôležitý aspekt legitimity je zapojenie okolitej komunity – organizačný tím by mal získať súhlas miestnych obyvateľov, ktorí priestor v súčasnosti využívajú.',
          },
        ),
        input(
          'dovodyZalozenia',
          {
            title: 'Prečo chcete na zvolenom pozemku založiť komunitnú záhradu?',
            type: 'text',
            required: true,
          },
          {
            placeholder: 'Chceme krajšie okolie',
            helptextHeader:
              'Vysvetlite, prečo považujete vhodné zabrať verejný priestor a vytvoriť na ňom priestor s menej verejným režimom,predpokladáme, že záhrady sú oplotené a poloverejné. Argumentmi môže byť doterajšie nevyužívanie alebo nevhodné využívanie priestoru, napr. nelegálne parkovisko na zeleni, zeleň bez udržiavaných sadových úprav, venčisko psov znižujúce kvalitu života okolitých obyvateľov, neprístupný nevyužívaný priestor, nedostatočne využívaný priestor miestnou komunitou.',
          },
        ),
        input(
          'organizacnyTim',
          {
            title: 'Popíšte organizačný tím záhrady',
            type: 'text',
            required: true,
          },
          {
            placeholder: 'Menovite alebo vecne',
          },
        ),
        input(
          'inkluzivnost',
          {
            title: 'Inkluzívnosť projektu/ režim komunitnej záhrady',
            type: 'text',
            required: true,
          },
          {
            placeholder: 'Režim záhrady',
            helptextHeader:
              'Ako zabezpečíte otvorenosť projektu, kto bude mať priamy či nepriamy úžitok z projektu, ako vyberiete, kto bude záhradkár, ako sa vysporiadate so situáciou, ak budete mať väčší záujem o záhradkárčenie, než budete mať kapacitu nasýtiť?',
          },
        ),
        input(
          'financovanie',
          {
            title: 'Spôsob financovania záhrady',
            type: 'text',
            required: true,
          },
          {
            placeholder: 'Financovanie',
            helptextHeader: 'Členský poplatok a granty? Aké zdroje už máte a aké plánujete získať?',
          },
        ),
      ],
    ),
    step('prilohy', { title: 'Nahrajte prosím prílohy', stepperTitle: 'Prílohy' }, [
      fileUpload(
        'rozpocet',
        {
          title: 'Predbežný rozpočet projektu ročne',
        },
        {
          type: 'button',
        },
      ),
      fileUpload(
        'umiestnenie',
        {
          title: 'Presné umiestnenie záhrady na pozemku',
        },
        {
          type: 'button',
          helptextHeader: markdownText(
            'Zakreslenie presného umiestnenia záhrady na pozemku urýchli celý proces - mesto bude vedieť o ktorú časť pozemku máte konkrétne záujem. Využiť môžete portál [ZBGIS](https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster), kde si nájdete pozemok a na snímku obrazovky vyznačíte presné umiestnenie záhrady (ohraničenie).',
          ),
        },
      ),
      fileUpload(
        'dizajn',
        {
          title: 'Dizajn a projekt záhrady',
        },
        {
          type: 'button',
          helptextHeader:
            'Prílohou projektu je situácia záhrady spracovaná v adekvátnej mierke, ktorá bude ilustrovať plánované využitie a umiestnenie jednotlivých prvkov na záhrade. Napríklad: záhony či pestovacie boxy, výsadzbu akejkoľvek trvalkovej zelene, kríkov a stromov spolu s druhovým špecifikovaním tejto zelene, kompost, mobiliár, priestor na uskladnenie náradia a zariadenia záhrady, priestor pre využívanie grilu, spôsob zabezpečenia vody a jej distribúcie.',
        },
      ),
      fileUpload(
        'prevadzka',
        {
          title: 'Prevádzka a údržba záhrady',
        },
        {
          type: 'button',
          helptextHeader:
            'Kto bude akým spôsobom zabezpečovať prevádzku záhrady z hľadiska údržby zelene (napríklad kosenie), starostlivosť o poriadok, ako bude zabezpečený odpad (ideálne je napríklad zaviazať sa ku zero-waste režimu, kde každý, kto vytvorí v priestore odpad bude zodpovedný za jeho likvidáciu v priestore svojej domácnosti).',
        },
      ),
    ]),
  ],
)
