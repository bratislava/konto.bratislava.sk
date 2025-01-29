import priznanieKDaniZNehnutelnostiExample1 from './examples/priznanieKDaniZNehnutelnostiExample1'
import priznanieKDaniZNehnutelnostiExample5 from './examples/priznanieKDaniZNehnutelnostiExample5'
import priznanieKDaniZNehnutelnostiExample2 from './examples/priznanieKDaniZNehnutelnostiExample2'
import priznanieKDaniZNehnutelnostiExample3 from './examples/priznanieKDaniZNehnutelnostiExample3'
import priznanieKDaniZNehnutelnostiExample4 from './examples/priznanieKDaniZNehnutelnostiExample4'
import predzahradkyExample from './examples/predzahradkyExample'
import { ExampleForm } from './types'
import zavazneStanoviskoKInvesticnejCinnostiExample from './examples/zavazneStanoviskoKInvesticnejCinnostiExample'
import komunitneZahradyExample from './examples/komunitneZahradyExample'
import stanoviskoKInvesticnemuZameruExample from './examples/stanoviskoKInvesticnemuZameruExample'
import ziadostONajomBytuExample from './examples/ziadostONajomBytuExample'
import oloMimoriadnyOdvozAZhodnotenieOdpaduExample from './examples/oloMimoriadnyOdvozAZhodnotenieOdpaduExample'
import oloEnergetickeZhodnotenieOdpaduVZevoExample from './examples/oloEnergetickeZhodnotenieOdpaduVZevoExample'
import oloTriedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExample from './examples/oloTriedenyZberPapieraPlastovASklaPreSpravcovskeSpolocnostiExample'
import oloTriedenyZberPapieraPlastovASklaPrePravnickeOsobyExample from './examples/oloTriedenyZberPapieraPlastovASklaPrePravnickeOsobyExample'
import oloOdvozObjemnehoOdpaduValnikomExample from './examples/oloOdvozObjemnehoOdpaduValnikomExample'
import oloOloTaxiExample from './examples/oloOloTaxiExample'
import oloPodnetyAPochvalyObcanovExample from './examples/oloPodnetyAPochvalyObcanovExample'
import oloKoloTaxiExample from './examples/oloKoloTaxiExample'
import oloUzatvorenieZmluvyONakladaniSOdpadomExample from './examples/oloUzatvorenieZmluvyONakladaniSOdpadomExample'
import oloDocistenieStanovistaZbernychNadobExample from './examples/oloDocistenieStanovistaZbernychNadobExample'
import oloOdvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExample from './examples/oloOdvozOdpaduVelkokapacitnymAleboLisovacimKontajneromExample'
import oznamenieOPoplatkovejPovinnostiZaKomunalneOdpadyExample from './examples/oznamenieOPoplatkovejPovinnostiZaKomunalneOdpadyExample'

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
}

export const exampleDevForms: Record<string, ExampleForm[]> = {}
