import { Builder } from 'xml2js'

import { TaxFormData } from './types'
import { formatXsDateTimeXml } from './mapping/xml/functions'
import { oddiel2Xml } from './mapping/xml/oddiel2'
import { oddiel3JedenUcelXml } from './mapping/xml/oddiel3JedenUcel'
import { oddiel3ViacereUcelyXml } from './mapping/xml/oddiel3ViacereUcely'
import { oddiel4Xml } from './mapping/xml/oddiel4'
import { oslobodenieXml } from './mapping/xml/oslobodenie'
import { prilohyXml } from './mapping/xml/prilohy'
import { udajeODanovnikoviXml } from './mapping/xml/udajeODanovnikovi'
import { removeEmptySubtrees } from './helpers/removeEmptySubtrees'

export const generateTaxXml = (
  data: TaxFormData,
  pretty = false,
  pospID: string = 'esmao.eforms.bratislava.obec_024',
  version: string = '201501.2',
) => {
  const jsonObj = {
    'E-form': {
      $: {
        xmlns: `http://schemas.gov.sk/form/${pospID}/${version}`,
      },
      Meta: {
        ID: pospID,
        Name: 'Ohlásenie o vzniku, zániku alebo zmene daňovej povinnosti k dani z nehnuteľností',
        Gestor: 'ESMaO',
        RecipientId: 'ico://sk/00603481',
        Version: version,
        ZepRequired: false,
      },
      Body: {
        ...udajeODanovnikoviXml(data),
        ...oddiel2Xml(data),
        ...oddiel3JedenUcelXml(data),
        ...oddiel3ViacereUcelyXml(data),
        ...oddiel4Xml(data),
        ...oslobodenieXml(data),
        ...prilohyXml(data),
        DatumZadaniaPodania: formatXsDateTimeXml(new Date()),
        ZakladneVyhlasenie: {
          SpravnostUdajovText:
            'Všeobecné informácie o poskytnutí, spracovaní a ochrane osobných údajov nájdete na https://esluzby.bratislava.sk/page/ochrana-osobnych-udajov',
          SuhlasSoSpracovanimText:
            'Týmto dávam na základe slobodnej vôle súhlas na spracovanie mojich osobných údajov uvedených vo formulári tohto podania a získaných z môjho osobného dokladu za v zmysle Nariadenia európskeho parlamentu a rady EÚ 2016/679 o ochrane fyzických osôb pri spracúvaní osobných údajov a o voľnom pohybe takýchto údajov a zákona č. 18/2018 Z.z. o ochrane osobných údajov a o zmene a doplnení niektorých zákonov. Zároveň potvrdzujem dovŕšenie veku 16 rokov pre potreby spracovania osobných údajov. Osobné údaje poskytujem za účelom spracovania mojej žiadosti.',
          PoskytujemSuhlas: 'true',
          PoskytujemSuhlasText: 'Poskytujem súhlas na spracovanie osobných údajov',
          NeposkytujemSuhlas: 'false',
          NeposkytujemSuhlasText: 'Neposkytujem súhlas na spracovanie osobných údajov',
        },
        Dorucenie: {
          AdresatPodania: {
            AdresatPodania: 'Mesto',
          },
          Checkbox: {
            Notifikacia: 'true',
          },
          FormaOdoslaniaZiadosti: 'Elektronicky',
          FormaDoruceniaRozhodnutia: {
            TypSposobuDorucenia: 'Elektronická schránka',
          },
        },
      },
    },
  }

  const jsonObjWithoutLeafs = removeEmptySubtrees(jsonObj)

  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty },
  })
  return builder.buildObject(jsonObjWithoutLeafs)
}
