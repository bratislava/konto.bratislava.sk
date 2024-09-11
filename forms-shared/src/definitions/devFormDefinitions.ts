import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import mimoriadnyOdvozALikvidaciaOdpadu from '../schemas/olo/mimoriadnyOdvozALikvidaciaOdpadu'
import zevoMechanickaVykladkaAZhodnotenieOdpaduPodlaIntegrovanehoPovlenia from '../schemas/olo/zevoMechanickaVykladkaAZhodnotenieOdpaduPodlaIntegrovanehoPovlenia'
import zevoRucnaVykladkaAZhodnotenieOdpaduPodlaIntegrovanehoPovlenia from '../schemas/olo/zevoRucnaVykladkaAZhodnotenieOdpaduPodlaIntegrovanehoPovlenia'
import zevoPodrvenieAZhodnotenieOdpaduVysypanimDoZasobnika from '../schemas/olo/zevoPodrvenieAZhodnotenieOdpaduVysypanimDoZasobnika'
import zevoUzatvorenieZmluvyONakladaniSOdpadom from '../schemas/olo/zevoUzatvorenieZmluvyONakladaniSOdpadom'
import docisteniStanovistaZbernychNadob from '../schemas/olo/docisteniStanovistaZbernychNadob'
import odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom from '../schemas/olo/odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom'
import koloTaxi from '../schemas/olo/koloTaxi'
import oloTaxi from '../schemas/olo/oloTaxi'
import podnetyAPochvalyObcanov from '../schemas/olo/podnetyAPochvalyObcanov'
import odvozObjemnehoOdpaduValnikom from '../schemas/olo/odvozObjemnehoOdpaduValnikom'
import triedenyZberPapieraPlastovASklaPrePravnickeOsoby from '../schemas/olo/triedenyZberPapieraPlastovASklaPrePravnickeOsoby'
import triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti from '../schemas/olo/triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti'

export const devFormDefinitions: FormDefinition[] = [
  {
    type: FormDefinitionType.Email,
    slug: 'olo-mimoriadny-odvoz-a-likvidacia-odpadu',
    title: 'Mimoriadny odvoz a likvidácia odpadu',
    schemas: mimoriadnyOdvozALikvidaciaOdpadu,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-zevo-mechanicka-vykladka-a-zhodnotenie-odpadu-podla-integrovaneho-povolenia',
    title: 'Mechanická vykládka a zhodnotenie odpadu podľa integrovaného povolenia',
    schemas: zevoMechanickaVykladkaAZhodnotenieOdpaduPodlaIntegrovanehoPovlenia,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-zevo-rucna-vykladka-a-zhodnotenie-odpadu-podla-integrovaneho-povolenia',
    title: 'Ručná vykládka a zhodnotenie odpadu podľa integrovaného povolenia',
    schemas: zevoRucnaVykladkaAZhodnotenieOdpaduPodlaIntegrovanehoPovlenia,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-zevo-podrvenie-a-zhodnotenie-odpadu-vysypanim-do-zasobnika',
    title: 'Podrvenie a zhodnotenie odpadu vysypaním do zásobníka',
    schemas: zevoPodrvenieAZhodnotenieOdpaduVysypanimDoZasobnika,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-zevo-uzatvorenie-zmluvy-o-nakladani-s-odpadom',
    title: 'Uzatvorenie zmluvy o nakladaní s odpadom',
    schemas: zevoUzatvorenieZmluvyONakladaniSOdpadom,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-docistenie-stanovista-zbernych-nadob',
    title: 'Dočistenie stanovišťa zberných nádob',
    schemas: docisteniStanovistaZbernychNadob,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-odvoz-odpadu-velkokapacitnym-alebo-lisovacim-kontajnerom',
    title: 'Odvoz odpadu veľkokapacitným alebo lisovacím kontajnerom',
    schemas: odvozOdpaduVelkokapacitnymAleboLisovacimKontajnerom,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-kolo-taxi',
    title: 'KOLO Taxi',
    schemas: koloTaxi,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-olo-taxi',
    title: 'OLO Taxi',
    schemas: oloTaxi,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-podnety-a-pochvaly-obcanov',
    title: 'Podnety a pochvaly občanov',
    schemas: podnetyAPochvalyObcanov,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-odvoz-objemneho-odpadu-valnikom',
    title: 'Odvoz objemného odpadu valníkom',
    schemas: odvozObjemnehoOdpaduValnikom,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-pravnicke-osoby',
    title: 'Triedený zber papiera, plastov a skla pre právnické osoby',
    schemas: triedenyZberPapieraPlastovASklaPrePravnickeOsoby,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-triedeny-zber-papiera-plastov-a-skla-pre-spravcovske-spolocnosti',
    title: 'Triedený zber papiera, plastov a skla pre správcovské spoločnosti',
    schemas: triedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnosti,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
  },
]
