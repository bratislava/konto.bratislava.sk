import { selectMultiple } from '../../generator/functions/selectMultiple'
import { input } from '../../generator/functions/input'
import { radioGroup } from '../../generator/functions/radioGroup'
import { datePicker } from '../../generator/functions/datePicker'
import { step } from '../../generator/functions/step'
import { schema } from '../../generator/functions/schema'
import { fileUploadMultiple } from '../../generator/functions/fileUploadMultiple'
import { getObjednavatelZiadatelStep } from './shared/getObjednavatelZiadatelStep'
import { esbsKatastralneUzemiaCiselnik } from '../../tax-form/mapping/shared/esbsCiselniky'

export default schema(
  {
    title: 'Žiadosť o stanovisko k projektovej dokumentácii',
  },
  {},
  [
    getObjednavatelZiadatelStep('ziadatel'),
    step('udajeOStavbe', { title: 'Údaje o stavbe' }, [
      input(
        'nazovStavby',
        { type: 'text', title: 'Názov stavby', required: true },
        {
          helptext: 'Napríklad: Polyfunkčný objekt ABC',
        },
      ),
      input(
        'adresaStavby',
        { type: 'text', title: 'Adresa stavby', required: true },
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
      datePicker(
        'predpokladanyTerminStavbyOd',
        { title: 'Predpokladaný termín stavby od', required: true },
        { selfColumn: '2/4' },
      ),
      datePicker(
        'predpokladanyTerminStavbyDo',
        { title: 'Predpokladaný termín stavby do', required: true },
        { selfColumn: '2/4' },
      ),
      radioGroup(
        'stupenProjektovejDokumentacie',
        {
          type: 'string',
          title: 'Stupeň projektovej dokumentácie',
          required: true,
          items: [
            {
              value: 'dokumentaciaPreUzemneneRozhodnutie',
              label: 'Dokumentácia pre územné rozhodnutie (DÚR)',
            },
            {
              value: 'dokumentaciaPreStavbnePovolenie',
              label: 'Dokumentácia pre stavebné povolenie (DSP)',
            },
            {
              value: 'dokumentaciaPreRealizaciuStavby',
              label: 'Dokumentácia pre realizáciu stavby (DRS)',
            },
          ],
        },
        { variant: 'boxed', orientations: 'column' },
      ),
    ]),
    step('prilohy', { title: 'Prílohy' }, [
      fileUploadMultiple(
        'technickaSprava',
        {
          title: 'Technická správa',
          required: true,
        },
        {
          type: 'dragAndDrop',
          helptext: 'Technická správa s popisom navrhovaného technického riešenia.',
        },
      ),
      fileUploadMultiple(
        'vyznaceneZaujmoveUzemie',
        {
          title: 'Vyznačené záujmové územie na katastrálnej mape',
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
      fileUploadMultiple(
        'situacnyVykres',
        {
          title: 'Situačný výkres',
          required: true,
        },
        {
          type: 'dragAndDrop',
        },
      ),
      fileUploadMultiple(
        'svetelnoTechnickyVypocet',
        {
          title: 'Svetelno-technický výpočet',
          required: false,
        },
        {
          type: 'dragAndDrop',
          helptext: 'Výpočet je nutné doložiť v prípade stavby verejného osvetlenia.',
        },
      ),
    ]),
  ],
)
