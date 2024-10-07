import { FormDefinition, FormDefinitionType } from './formDefinitionTypes'
import { generalTermsAndConditions } from './termsAndConditions'
import mimoriadnyOdvozAZhodnotenieOdpadu from '../schemas/olo/mimoriadnyOdvozAZhodnotenieOdpadu'
import energetickeZhodnotenieOdpaduVZevo from '../schemas/olo/energetickeZhodnotenieOdpaduVZevo'
import uzatvorenieZmluvyONakladaniSOdpadom from '../schemas/olo/uzatvorenieZmluvyONakladaniSOdpadom'
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
    slug: 'olo-mimoriadny-odvoz-a-zhodnotenie-odpadu',
    title: 'Mimoriadny odvoz a zhodnotenie odpadu',
    schemas: mimoriadnyOdvozAZhodnotenieOdpadu,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingByUnverifiedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO,
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-energeticke-zhodnotenie-odpadu-v-zevo',
    title: 'Energetické zhodnotenie odpadu v ZEVO',
    schemas: energetickeZhodnotenieOdpaduVZevo,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingByUnverifiedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
  {
    type: FormDefinitionType.Email,
    slug: 'olo-uzatvorenie-zmluvy-o-nakladani-s-odpadom',
    title: 'Uzatvorenie zmluvy o nakladaní s odpadom',
    schemas: uzatvorenieZmluvyONakladaniSOdpadom,
    email: '',
    termsAndConditions: generalTermsAndConditions,
    messageSubjectDefault: '',
    embedded: 'olo',
    allowSendingByUnverifiedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
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
    allowSendingByUnverifiedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
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
    allowSendingByUnverifiedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
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
    allowSendingByUnverifiedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
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
    allowSendingByUnverifiedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
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
    allowSendingByUnverifiedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
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
    allowSendingByUnverifiedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
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
    allowSendingByUnverifiedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
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
    allowSendingByUnverifiedUsers: true,
    userEmailPath: '', // TODO,
    userNamePath: '', // TODO
  },
]
