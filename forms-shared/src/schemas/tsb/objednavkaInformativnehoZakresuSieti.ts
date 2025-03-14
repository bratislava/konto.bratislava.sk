import { selectMultiple } from '../../generator/functions/selectMultiple'
import { input } from '../../generator/functions/input'
import { fileUpload } from '../../generator/functions/fileUpload'
import { object } from '../../generator/object'
import { step } from '../../generator/functions/step'
import { schema } from '../../generator/functions/schema'
import { getObjednavatelZiadatelStep } from './shared/getObjednavatelZiadatelStep'
import { esbsKatastralneUzemiaCiselnik } from '../../tax-form/mapping/shared/esbsCiselniky'

export default schema(
  {
    title: 'Objednávka informatívneho zákresu sietí',
  },
  {},
  [
    getObjednavatelZiadatelStep('objednavatel'),
    step('udaje', { title: 'Údaje' }, [
      object(
        'fakturacneUdaje',
        { required: true },
        { objectDisplay: 'boxed', title: 'Fakturačné údaje' },
        [
          input(
            'fakturacnaAdresa',
            { title: 'Fakturačná adresa', required: true, type: 'text' },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
          input('mesto', { title: 'Mesto', required: true, type: 'text' }, { selfColumn: '3/4' }),
          input('psc', { title: 'PSČ', required: true, type: 'text' }, { selfColumn: '1/4' }),
          input(
            'email',
            { title: 'E-mail', required: true, type: 'email' },
            { helptext: 'Faktúra vám bude zaslaná prostredníctvom tohto emailu' },
          ),
        ],
      ),
      object(
        'udajeObjednavky',
        { required: true },
        { objectDisplay: 'boxed', title: 'Údaje objednávky' },
        [
          input(
            'adresaObjednavky',
            { title: 'Adresa objednávky', required: true, type: 'text' },
            { helptext: 'Vyplňte vo formáte ulica a číslo' },
          ),
          selectMultiple(
            'katastralneUzemie',
            {
              title: 'Katastrálne územie',
              required: true,
              items: esbsKatastralneUzemiaCiselnik.map(({ Name, Code }) => ({
                value: Code,
                label: Name,
              })),
            },
            {
              helptext: 'Vyberte jedno alebo viacero katastrálnych území zo zoznamu.',
            },
          ),
        ],
      ),
    ]),
    step('prilohy', { title: 'Prílohy' }, [
      fileUpload(
        'snimkaMapy',
        {
          title: 'Snímka z mapy s vyznačeným záujmovým územím',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext: `Využiť môžete napríklad [Google mapy](https://www.google.com/maps/@48.1461708,17.1057168,13z), kde nájdete požadované záujmové územie.

**Ako vytvoriť snímku?**
Prejdite do [webovej verzie Google Máp](https://www.google.com/maps/@48.1461708,17.1057168,13z). Kliknutím pravým tlačidlom myši na požadované územie otvorite ponuku, v ktorej nájdete možnosť „Merať vzdialenosť“. Vyznačte požadované územie vytvorením uceleného tvaru (polygónu) a následne s vyznačenou plochou vytvorte snímku obrazovky. Na snímke ponechajte aj pole s odmeranou plochou, ktoré sa zobrazí v spodnej časti obrazovky. Snímku uložte a nahrajte do poľa nižšie.`,
          helptextMarkdown: true,
        },
      ),
    ]),
  ],
)
