import komunitneZahradyExample from './examples/komunitneZahradyExample'
import kontaktnyFormularPaasExample1 from './examples/kontaktnyFormularPaasExample1'
import kontaktnyFormularPaasExample2 from './examples/kontaktnyFormularPaasExample2'
import nahlaseniePodnetuKElektrickymKolobezkamExample from './examples/nahlaseniePodnetuKElektrickymKolobezkamExample'
import oloDocistenieStanovistaZbernychNadobExample from './examples/oloDocistenieStanovistaZbernychNadobExample'
import oloEnergetickeZhodnotenieOdpaduVZevoExample from './examples/oloEnergetickeZhodnotenieOdpaduVZevoExample'
import oloKoloTaxiExample from './examples/oloKoloTaxiExample'
import oloMimoriadnyOdvozAZhodnotenieOdpaduExample from './examples/oloMimoriadnyOdvozAZhodnotenieOdpaduExample'
import oloOdvozObjemnehoOdpaduValnikomExample from './examples/oloOdvozObjemnehoOdpaduValnikomExample'
import oloOdvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExample from './examples/oloOdvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExample'
import oloOloTaxiExample from './examples/oloOloTaxiExample'
import oloPodnetyAPochvalyObcanovExample from './examples/oloPodnetyAPochvalyObcanovExample'
import oloTriedenyZberPapieraPlastovASklaPrePravnickeOsobyExample from './examples/oloTriedenyZberPapieraPlastovASklaPrePravnickeOsobyExample'
import oloTriedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExample from './examples/oloTriedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExample'
import oloUzatvorenieZmluvyONakladaniSOdpadomExample from './examples/oloUzatvorenieZmluvyONakladaniSOdpadomExample'
import oznamenieOPoplatkovejPovinnostiZaKomunalneOdpadyExample from './examples/oznamenieOPoplatkovejPovinnostiZaKomunalneOdpadyExample'
import predzahradkyExample from './examples/predzahradkyExample'
import priznanieKDaniZNehnutelnostiExample1 from './examples/priznanieKDaniZNehnutelnostiExample1'
import priznanieKDaniZNehnutelnostiExample2 from './examples/priznanieKDaniZNehnutelnostiExample2'
import priznanieKDaniZNehnutelnostiExample3 from './examples/priznanieKDaniZNehnutelnostiExample3'
import priznanieKDaniZNehnutelnostiExample4 from './examples/priznanieKDaniZNehnutelnostiExample4'
import priznanieKDaniZNehnutelnostiExample5 from './examples/priznanieKDaniZNehnutelnostiExample5'
import priznanieKDaniZNehnutelnostiExample5NoCalculators from './examples/priznanieKDaniZNehnutelnostiExample5NoCalculators'
import stanoviskoKInvesticnemuZameruExample from './examples/stanoviskoKInvesticnemuZameruExample'
import zavazneStanoviskoKInvesticnejCinnostiExample from './examples/zavazneStanoviskoKInvesticnejCinnostiExample'
import ziadostONajomBytuExample from './examples/ziadostONajomBytuExample'
import ziadostOSlobodnyPristupKInformaciamExample from './examples/ziadostOSlobodnyPristupKInformaciamExample'
import ziadostOUzemnoplanovaciuInformaciuExample from './examples/ziadostOUzemnoplanovaciuInformaciuExample'
import { ExampleForm } from './types'

export const exampleForms: Record<string, ExampleForm[]> = {
  'stanovisko-k-investicnemu-zameru': [stanoviskoKInvesticnemuZameruExample],
  'zavazne-stanovisko-k-investicnej-cinnosti': [zavazneStanoviskoKInvesticnejCinnostiExample],
  predzahradky: [predzahradkyExample],
  'komunitne-zahrady': [komunitneZahradyExample],
  'priznanie-k-dani-z-nehnutelnosti': [
    priznanieKDaniZNehnutelnostiExample1,
    priznanieKDaniZNehnutelnostiExample2,
    priznanieKDaniZNehnutelnostiExample3,
    priznanieKDaniZNehnutelnostiExample4,
    priznanieKDaniZNehnutelnostiExample5,
    priznanieKDaniZNehnutelnostiExample5NoCalculators,
  ],
  'ziadost-o-najom-bytu': [ziadostONajomBytuExample],
  'olo-mimoriadny-odvoz-a-zhodnotenie-odpadu': [oloMimoriadnyOdvozAZhodnotenieOdpaduExample],
  'olo-energeticke-zhodnotenie-odpadu-v-zevo': [oloEnergetickeZhodnotenieOdpaduVZevoExample],
  'olo-triedeny-zber-papiera-plastov-a-skla-pre-spravcovske-spolocnosti': [
    oloTriedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExample,
  ],
  'olo-triedeny-zber-papiera-plastov-a-skla-pre-pravnicke-osoby': [
    oloTriedenyZberPapieraPlastovASklaPrePravnickeOsobyExample,
  ],
  'olo-odvoz-objemneho-odpadu-valnikom': [oloOdvozObjemnehoOdpaduValnikomExample],
  'olo-olo-taxi': [oloOloTaxiExample],
  'olo-podnety-a-pochvaly-obcanov': [oloPodnetyAPochvalyObcanovExample],
  'olo-kolo-taxi': [oloKoloTaxiExample],
  'olo-docistenie-stanovista-zbernych-nadob': [oloDocistenieStanovistaZbernychNadobExample],
  'olo-odvoz-odpadu-velkokapacitnym-alebo-lisovacim-kontajnerom': [
    oloOdvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExample,
  ],
  'olo-uzatvorenie-zmluvy-o-nakladani-s-odpadom': [oloUzatvorenieZmluvyONakladaniSOdpadomExample],
  'oznamenie-o-poplatkovej-povinnosti-za-komunalne-odpady': [
    oznamenieOPoplatkovejPovinnostiZaKomunalneOdpadyExample,
  ],
  'ziadost-o-slobodny-pristup-k-informaciam': [ziadostOSlobodnyPristupKInformaciamExample],
  'ziadost-o-uzemnoplanovaciu-informaciu': [ziadostOUzemnoplanovaciuInformaciuExample],
  'nahlasenie-podnetu-k-elektrickym-kolobezkam': [nahlaseniePodnetuKElektrickymKolobezkamExample],
  'paas-kontaktny-formular': [kontaktnyFormularPaasExample1, kontaktnyFormularPaasExample2],
}

export const exampleDevForms: Record<string, ExampleForm[]> = {}
