import { renderApacheFopPdf } from '../test-utils/apache-fop/renderApacheFopPdf'
import { expectPdfToMatchSnapshot } from '../test-utils/expectPdfToMatchSnapshot'

describe.only('renderApacheFopPdf', () => {
  // Temporary XML/XSL until we start to use it for forms
  const xmlString = `<Form>
        <Step id="root_druhPriznania" title="Druh priznania">
          <Field id="root_druhPriznania_druh" label="Vyberte druh priznania">
            <StringValue>Opravné priznanie</StringValue>
          </Field>
          <Field id="root_druhPriznania_rok" label="Za aký rok podávate priznanie?">
            <StringValue>2024</StringValue>
          </Field>
        </Step>
        <Step id="root_udajeODanovnikovi" title="Údaje o daňovníkovi">
          <Field id="root_udajeODanovnikovi_voSvojomMene" label="Podávate priznanie k dani z nehnuteľností vo svojom mene?">
            <StringValue>Áno</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_priznanieAko" label="Podávate priznanie ako">
            <StringValue>Fyzická osoba</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_rodneCislo" label="Rodné číslo">
            <StringValue>9203146326</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_priezvisko" label="Priezvisko">
            <StringValue>Abraham</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_menoTitul_meno" label="Meno">
            <StringValue>Lincoln</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_menoTitul_titul" label="Titul">
            <StringValue>Mgr.</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_ulicaCisloFyzickaOsoba_ulica" label="Ulica">
            <StringValue>Robotnícka</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_ulicaCisloFyzickaOsoba_cislo" label="Čislo">
            <StringValue>6</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_obecPsc_obec" label="Obec">
            <StringValue>Bratislava</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_obecPsc_psc" label="PSČ">
            <StringValue>83103</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_stat" label="Štát">
            <StringValue>Senegalská republika</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_korespondencnaAdresa_korespondencnaAdresaRovnaka" label="Je korešpondenčná adresa rovnáká ako adresa trvalého pobytu?">
            <StringValue>Nie</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_korespondencnaAdresa_ulicaCisloKorespondencnaAdresa_ulica" label="Ulica">
            <StringValue>Prašivá</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_korespondencnaAdresa_ulicaCisloKorespondencnaAdresa_cislo" label="Čislo">
            <StringValue>7</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_korespondencnaAdresa_obecPsc_obec" label="Obec">
            <StringValue>Bratislava</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_korespondencnaAdresa_obecPsc_psc" label="PSČ">
            <StringValue>83106</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_korespondencnaAdresa_stat" label="Štát">
            <StringValue>Slovenská republika</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_email" label="E-mail">
            <StringValue>test@test.com</StringValue>
          </Field>
          <Field id="root_udajeODanovnikovi_telefon" label="Telefónne číslo">
            <StringValue>+421948417711</StringValue>
          </Field>
        </Step>
        <Step id="root_danZPozemkov" title="Priznanie k dani z pozemkov">
          <Field id="root_danZPozemkov_vyplnitObject_vyplnit" label="Chcete podať daňové priznanie k dani z pozemkov?">
            <StringValue>Áno</StringValue>
          </Field>
          <Field id="root_danZPozemkov_kalkulackaWrapper_pouzitKalkulacku" label="Kalkulačka výpočtu výmery pozemkov">
            <StringValue>Chcem pomôcť s výpočtom a použiť kalkulačku výpočtu výmery pozemkov</StringValue>
          </Field>
          <Array id="root_danZPozemkov_priznania" title="Priznania k dani z pozemkov">
            <ArrayItem id="root_danZPozemkov_priznania_0" title="Priznanie k dani z pozemkov č. 1">
              <Field id="root_danZPozemkov_priznania_0_pravnyVztah" label="Právny vzťah">
                <StringValue>Vlastník</StringValue>
              </Field>
              <Field id="root_danZPozemkov_priznania_0_spoluvlastnictvo" label="Spoluvlastníctvo">
                <StringValue>Som jediný vlastník</StringValue>
              </Field>
              <Field id="root_danZPozemkov_priznania_0_poznamka" label="Poznámka">
                <NoneValue/>
              </Field>
              <Array id="root_danZPozemkov_priznania_0_pozemky" title="Pozemky">
                <ArrayItem id="root_danZPozemkov_priznania_0_pozemky_0" title="Pozemok č. 1">
                  <Field id="root_danZPozemkov_priznania_0_pozemky_0_cisloListuVlastnictva" label="Číslo listu vlastníctva">
                    <StringValue>4589</StringValue>
                  </Field>
                  <Field id="root_danZPozemkov_priznania_0_pozemky_0_kataster" label="Názov katastrálneho územia">
                    <StringValue>Devínska Nová Ves</StringValue>
                  </Field>
                  <Field id="root_danZPozemkov_priznania_0_pozemky_0_parcelneCisloSposobVyuzitiaPozemku_cisloParcely" label="Číslo parcely">
                    <StringValue>7986/1</StringValue>
                  </Field>
                  <Field id="root_danZPozemkov_priznania_0_pozemky_0_parcelneCisloSposobVyuzitiaPozemku_sposobVyuzitiaPozemku" label="Spôsob využitia pozemku">
                    <StringValue>Ložisko</StringValue>
                  </Field>
                  <Field id="root_danZPozemkov_priznania_0_pozemky_0_druhPozemku" label="Druh pozemku">
                    <StringValue>B – trvalé trávnaté porasty</StringValue>
                  </Field>
                  <Field id="root_danZPozemkov_priznania_0_pozemky_0_celkovaVymeraPozemku" label="Celková výmera pozemku">
                    <StringValue>218</StringValue>
                  </Field>
                  <Field id="root_danZPozemkov_priznania_0_pozemky_0_podielPriestoruNaSpolocnychCastiachAZariadeniachDomu" label="Podiel priestoru na spoločných častiach a zariadeniach domu">
                    <StringValue>4587/53994</StringValue>
                  </Field>
                  <Field id="root_danZPozemkov_priznania_0_pozemky_0_spoluvlastnickyPodiel" label="Spoluvlastnícky podiel">
                    <StringValue>1/1</StringValue>
                  </Field>
                  <Field id="root_danZPozemkov_priznania_0_pozemky_0_datumy_datumVznikuDanovejPovinnosti" label="Dátum vzniku daňovej povinnosti">
                    <StringValue>13. 1. 2024</StringValue>
                  </Field>
                  <Field id="root_danZPozemkov_priznania_0_pozemky_0_datumy_datumZanikuDanovejPovinnosti" label="Dátum zániku daňovej povinnosti">
                    <StringValue>4. 1. 2024</StringValue>
                  </Field>
                </ArrayItem>
              </Array>
            </ArrayItem>
          </Array>
        </Step>
        <Step id="root_danZoStaviebJedenUcel" title="Priznanie k dani zo stavieb – stavba slúžiaca na jeden účel">
          <Field id="root_danZoStaviebJedenUcel_vyplnitObject_vyplnit" label="Chcete podať daňové priznanie k dani zo stavieb slúžiacich na jeden účel?">
            <StringValue>Áno</StringValue>
          </Field>
          <Field id="root_danZoStaviebJedenUcel_kalkulackaWrapper_pouzitKalkulacku" label="Kalkulačka výpočtu výmery zastavanej plochy stavby">
            <StringValue>Chcem pomôcť s výpočtom a použiť kalkulačku výpočtu zastavanej plochy</StringValue>
          </Field>
          <Array id="root_danZoStaviebJedenUcel_priznania" title="Priznania k dani zo stavieb slúžiacich na jeden účel">
            <ArrayItem id="root_danZoStaviebJedenUcel_priznania_0" title="Priznanie k dani zo stavby slúžiacej na jeden účel č. 1">
              <Field id="root_danZoStaviebJedenUcel_priznania_0_cisloListuVlastnictva" label="Číslo listu vlastníctva">
                <StringValue>4597</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_riadok1_ulicaACisloDomu" label="Ulica a číslo domu">
                <StringValue>Príkladná 35</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_riadok1_supisneCislo" label="Súpisné číslo">
                <StringValue>2526</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_riadok2_kataster" label="Názov katastrálneho územia">
                <StringValue>Jarovce</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_riadok2_cisloParcely" label="Číslo parcely">
                <StringValue>7859/1</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_pravnyVztah" label="Právny vzťah">
                <StringValue>Vlastník</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_spoluvlastnictvo" label="Spoluvlastníctvo">
                <StringValue>Podielové spoluvlastníctvo</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_pocetSpoluvlastnikov" label="Zadajte počet spoluvlastníkov">
                <StringValue>2</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_naZakladeDohody" label="Podávate priznanie za všetkých spoluvlastníkov na základe dohody?">
                <StringValue>Áno</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_splnomocnenie" label="Nahrajte sken dohody o určení zástupcu na podanie priznania k dani z nehnuteľností">
                <NoneValue/>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_predmetDane" label="Predmet dane">
                <StringValue>a) stavby na bývanie a drobné stavby, ktoré majú doplnkovú funkciu pre hlavnú stavbu</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_celkovaZastavanaPlocha" label="Celková zastavaná plocha">
                <StringValue>2659</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_spoluvlastnickyPodiel" label="Spoluvlastnícky podiel">
                <StringValue>1/2</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia" label="Počet nadzemných a podzemných podlaží stavby okrem prvého nadzemného podlažia">
                <StringValue>5</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_castStavbyOslobodenaOdDane" label="Máte časť stavby, ktorá podlieha oslobodeniu od dane zo stavieb podľa § 17 zákona č. 582/2004 Z.z. a VZN?">
                <StringValue>Áno</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_castStavbyOslobodenaOdDaneDetaily_celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby" label="Celková výmera podlahových plôch všetkých podlaží stavby">
                <StringValue>26</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_castStavbyOslobodenaOdDaneDetaily_vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb" label="Výmera podlahových plôch časti stavby, ktorá je oslobodená od dane zo stavieb">
                <StringValue>89</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_datumy_datumVznikuDanovejPovinnosti" label="Dátum vzniku daňovej povinnosti">
                <StringValue>4. 1. 2024</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_datumy_datumZanikuDanovejPovinnosti" label="Dátum zániku daňovej povinnosti">
                <StringValue>6. 1. 2024</StringValue>
              </Field>
              <Field id="root_danZoStaviebJedenUcel_priznania_0_poznamka" label="Poznámka">
                <NoneValue/>
              </Field>
            </ArrayItem>
          </Array>
        </Step>
        <Step id="root_danZoStaviebViacereUcely" title="Priznanie k dani zo stavieb – stavba slúžiaca na viaceré účely">
          <Field id="root_danZoStaviebViacereUcely_vyplnitObject_vyplnit" label="Chcete podať daňové priznanie k dani zo stavieb slúžiacich na viaceré účely?">
            <StringValue>Áno</StringValue>
          </Field>
          <Field id="root_danZoStaviebViacereUcely_kalkulackaWrapper_pouzitKalkulacku" label="Kalkulačka výpočtu výmery podlahových plôch a základu dane">
            <StringValue>Chcem pomôcť s výpočtom a použiť kalkulačku výmery podlahových plôch a základu dane</StringValue>
          </Field>
          <Array id="root_danZoStaviebViacereUcely_priznania" title="Priznania k dani zo stavieb slúžiacich na viaceré účely">
            <ArrayItem id="root_danZoStaviebViacereUcely_priznania_0" title="Priznanie k dani zo stavieb – stavba slúžiaca na viaceré účely č. 1">
              <Field id="root_danZoStaviebViacereUcely_priznania_0_cisloListuVlastnictva" label="Číslo listu vlastníctva">
                <StringValue>4597</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_riadok1_ulicaACisloDomu" label="Ulica a číslo domu">
                <StringValue>Príkladná 35</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_riadok1_supisneCislo" label="Súpisné číslo">
                <StringValue>35</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_riadok2_kataster" label="Názov katastrálneho územia">
                <StringValue>Devín</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_riadok2_cisloParcely" label="Číslo parcely">
                <StringValue>5697/1</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_pravnyVztah" label="Právny vzťah">
                <StringValue>Nájomca</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_spoluvlastnictvo" label="Spoluvlastníctvo">
                <StringValue>Bezpodielové spoluvlastníctvo manželov</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_popisStavby" label="Popis stavby">
                <StringValue>Príkladná stavba</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_datumy_datumVznikuDanovejPovinnosti" label="Dátum vzniku daňovej povinnosti">
                <StringValue>5. 1. 2024</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_datumy_datumZanikuDanovejPovinnosti" label="Dátum zániku daňovej povinnosti">
                <StringValue>4. 1. 2024</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_celkovaVymera" label="Celková výmera zastavanej plochy viacúčelovej stavby">
                <StringValue>25648</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia" label="Počet nadzemných a podzemných podlaží stavby okrem prvého nadzemného podlažia">
                <StringValue>4</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_castStavbyOslobodenaOdDane" label="Máte časť stavby, ktorá podlieha oslobodeniu od dane zo stavieb podľa § 17 zákona č. 582/2004 Z.z. a VZN?">
                <StringValue>Áno</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb" label="Výmera podlahových plôch časti stavby, ktorá je oslobodená od dane zo stavieb">
                <StringValue>26</StringValue>
              </Field>
              <Field id="root_danZoStaviebViacereUcely_priznania_0_poznamka" label="Poznámka">
                <StringValue>Príkladná 35</StringValue>
              </Field>
              <Array id="root_danZoStaviebViacereUcely_priznania_0_nehnutelnosti_nehnutelnosti" title="Aké nehnuteľnosti máte v tejto budove z hľadiska účelu?">
                <ArrayItem id="root_danZoStaviebViacereUcely_priznania_0_nehnutelnosti_nehnutelnosti_0" title="Časť stavby č. 1">
                  <Field id="root_danZoStaviebViacereUcely_priznania_0_nehnutelnosti_nehnutelnosti_0_ucelVyuzitiaStavby" label="Účel využitia stavby">
                    <StringValue>b) stavby na pôdohospodársku produkciu, skleníky, stavby pre vodné hospodárstvo, stavby využívané na skladovanie vlastnej pôdohospodárskej produkcie vrátane stavieb na vlastnú administratívu</StringValue>
                  </Field>
                  <Field id="root_danZoStaviebViacereUcely_priznania_0_nehnutelnosti_nehnutelnosti_0_podielPriestoruNaSpolocnychCastiachAZariadeniachDomu" label="Podiel priestoru na spoločných častiach a zariadeniach domu">
                    <StringValue>4598/26594</StringValue>
                  </Field>
                  <Field id="root_danZoStaviebViacereUcely_priznania_0_nehnutelnosti_nehnutelnosti_0_spoluvlastnickyPodiel" label="Spoluvlastnícky podiel">
                    <StringValue>1/1</StringValue>
                  </Field>
                </ArrayItem>
              </Array>
            </ArrayItem>
          </Array>
        </Step>
        <Step id="root_danZBytovANebytovychPriestorov" title="Priznanie k dani z bytov a z nebytových priestorov v bytovom dome">
          <Field id="root_danZBytovANebytovychPriestorov_vyplnitObject_vyplnit" label="Chcete podať daňové priznanie k dani z bytov a z nebytových priestorov v bytovom dome?">
            <StringValue>Áno</StringValue>
          </Field>
          <Field id="root_danZBytovANebytovychPriestorov_kalkulackaWrapper_pouzitKalkulacku" label="Kalkulačka výpočtu výmery podlahových plôch bytov a nebytových priestorov">
            <StringValue>Chcem pomôcť s výpočtom a použiť kalkulačku výmery podlahových plôch</StringValue>
          </Field>
          <Array id="root_danZBytovANebytovychPriestorov_priznania" title="Priznania k dani z bytov a z nebytových priestorov v bytovom dome">
            <ArrayItem id="root_danZBytovANebytovychPriestorov_priznania_0" title="Priznanie k dani z bytov a z nebytových priestorov v bytovom dome č. 1">
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_cisloListuVlastnictva" label="Číslo listu vlastníctva">
                <StringValue>2648</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_riadok1_ulicaACisloDomu" label="Ulica a číslo domu">
                <StringValue>Príkladná 35</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_riadok1_supisneCislo" label="Súpisné číslo">
                <StringValue>3694</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_riadok2_kataster" label="Názov katastrálneho územia">
                <StringValue>Karlova Ves</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_riadok2_cisloParcely" label="Číslo parcely">
                <StringValue>6975/2</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_pravnyVztah" label="Právny vzťah">
                <StringValue>Správca</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_spoluvlastnictvo" label="Spoluvlastníctvo">
                <StringValue>Podielové spoluvlastníctvo</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_pocetSpoluvlastnikov" label="Zadajte počet spoluvlastníkov">
                <StringValue>3</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_naZakladeDohody" label="Podávate priznanie za všetkých spoluvlastníkov na základe dohody?">
                <StringValue>Nie</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaByt_priznanieZaByt" label="Podávate priznanie za byt?">
                <StringValue>Áno</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaByt_cisloBytu" label="Číslo bytu">
                <StringValue>3</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaByt_popisBytu" label="Popis bytu">
                <StringValue>Dvojizbak</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaByt_podielPriestoruNaSpolocnychCastiachAZariadeniachDomu" label="Podiel priestoru na spoločných častiach a zariadeniach domu">
                <StringValue>2654/36594</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaByt_spoluvlastnickyPodiel" label="Spoluvlastnícky podiel">
                <StringValue>1/1</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaByt_vymeraPodlahovejPlochyNaIneUcely" label="Výmera podlahovej plochy bytu používaného na iné účely">
                <StringValue>18</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaByt_datumy_datumVznikuDanovejPovinnosti" label="Dátum vzniku daňovej povinnosti">
                <StringValue>16. 1. 2024</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaByt_datumy_datumZanikuDanovejPovinnosti" label="Dátum zániku daňovej povinnosti">
                <StringValue>7. 1. 2024</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaNebytovyPriestor_priznanieZaNebytovyPriestor" label="Podávate priznanie za nebytový priestor (napr. garážové státie, pivnica, obchodný priestor a pod.)?">
                <StringValue>Áno</StringValue>
              </Field>
              <Field id="root_danZBytovANebytovychPriestorov_priznania_0_poznamka" label="Poznámka">
                <StringValue>Príkladná 35</StringValue>
              </Field>
              <Array id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaNebytovyPriestor_nebytovePriestory" title="Nebytové priestory">
                <ArrayItem id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaNebytovyPriestor_nebytovePriestory_0" title="Nebytový priestor č. 1">
                  <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaNebytovyPriestor_nebytovePriestory_0_riadok_ucelVyuzitiaNebytovehoPriestoruVBytovomDome" label="Účel využitia nebytového priestoru v bytovom dome">
                    <StringValue>Garáž</StringValue>
                  </Field>
                  <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaNebytovyPriestor_nebytovePriestory_0_riadok_cisloNebytovehoPriestoruVBytovomDome" label="Číslo nebytového priestoru v bytovom dome">
                    <StringValue>G05</StringValue>
                  </Field>
                  <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaNebytovyPriestor_nebytovePriestory_0_podielPriestoruNaSpolocnychCastiachAZariadeniachDomu" label="Podiel priestoru na spoločných častiach a zariadeniach domu">
                    <StringValue>2659/86569</StringValue>
                  </Field>
                  <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaNebytovyPriestor_nebytovePriestory_0_spoluvlastnickyPodiel" label="Spoluvlastnícky podiel">
                    <StringValue>1/5</StringValue>
                  </Field>
                  <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaNebytovyPriestor_nebytovePriestory_0_datumy_datumVznikuDanovejPovinnosti" label="Dátum vzniku daňovej povinnosti">
                    <StringValue>5. 1. 2024</StringValue>
                  </Field>
                  <Field id="root_danZBytovANebytovychPriestorov_priznania_0_priznanieZaNebytovyPriestor_nebytovePriestory_0_datumy_datumZanikuDanovejPovinnosti" label="Dátum zániku daňovej povinnosti">
                    <StringValue>12. 1. 2024</StringValue>
                  </Field>
                </ArrayItem>
              </Array>
            </ArrayItem>
          </Array>
        </Step>
        <Step id="root_bezpodieloveSpoluvlastnictvoManzelov" title="Údaje o manželovi/manželke">
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_rodneCislo" label="Rodné číslo">
            <StringValue>920314/2634</StringValue>
          </Field>
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_priezvisko" label="Priezvisko">
            <StringValue>Príkladná</StringValue>
          </Field>
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_menoTitul_meno" label="Meno">
            <StringValue>Petra</StringValue>
          </Field>
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_menoTitul_titul" label="Titul">
            <StringValue>Bsc</StringValue>
          </Field>
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_rovnakaAdresa" label="Má trvalý pobyt na rovnakej adrese ako vy?">
            <StringValue>Nie</StringValue>
          </Field>
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_ulicaCisloBezpodieloveSpoluvlastnictvoManzelov_ulica" label="Ulica">
            <StringValue>Príkladná 35</StringValue>
          </Field>
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_ulicaCisloBezpodieloveSpoluvlastnictvoManzelov_cislo" label="Čislo">
            <StringValue>25</StringValue>
          </Field>
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_obecPsc_obec" label="Obec">
            <StringValue>Abelova</StringValue>
          </Field>
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_obecPsc_psc" label="PSČ">
            <StringValue>83106</StringValue>
          </Field>
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_stat" label="Štát">
            <StringValue>Slovenská republika</StringValue>
          </Field>
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_email" label="E-mail">
            <StringValue>test@test.com</StringValue>
          </Field>
          <Field id="root_bezpodieloveSpoluvlastnictvoManzelov_telefon" label="Telefónne číslo">
            <StringValue>+421948417711</StringValue>
          </Field>
        </Step>
        <Step id="root_znizenieAleboOslobodenieOdDane" title="Zníženie alebo oslobodenie od dane">
          <Field id="root_znizenieAleboOslobodenieOdDane_pozemky" label="Pozemky">
            <StringValue>pozemky, na ktorých sú cintoríny, kolumbáriá, urnové háje a rozptylové lúky</StringValue>
            <StringValue>pásma hygienickej ochrany vodných zdrojov I. stupňa a II. stupňa</StringValue>
            <StringValue>pozemky verejne prístupných parkov a verejne prístupných športovísk</StringValue>
            <StringValue>pozemky, ktorých vlastníkmi sú fyzické osoby staršie ako 65 rokov, ak tieto pozemky slúžia výhradne na ich osobnú potrebu</StringValue>
          </Field>
          <Field id="root_znizenieAleboOslobodenieOdDane_stavby" label="Stavby">
            <StringValue>stavby slúžiace detským domovom</StringValue>
            <StringValue>stavby na bývanie vo vlastníctve fyzických osôb starších ako 65 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ako aj prevažne alebo úplne bezvládnych fyzických osôb, ktoré slúžia na ich trvalé bývanie</StringValue>
            <StringValue>garáže v bytových domoch slúžiace ako garáž vo vlastníctve držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ktoré slúžia pre motorové vozidlo používané na ich dopravu</StringValue>
          </Field>
          <Field id="root_znizenieAleboOslobodenieOdDane_byty" label="Byty">
            <StringValue>byty vo vlastníctve fyzických osôb starších ako 65 rokov, držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ako aj prevažne alebo úplne bezvládnych fyzických osôb, ktoré slúžia na ich trvalé bývanie</StringValue>
            <StringValue>nebytové priestory v bytových domoch slúžiace ako garáž vo vlastníctve držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím alebo držiteľov preukazu fyzickej osoby s ťažkým zdravotným postihnutím so sprievodcom, ktoré slúžia pre motorové vozidlo používané na ich dopravu</StringValue>
          </Field>
          <Field id="root_znizenieAleboOslobodenieOdDane_poznamka" label="Poznámka">
            <StringValue>Príkladná 35</StringValue>
          </Field>
        </Step>
      </Form>`

  const xslString = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:fo="http://www.w3.org/1999/XSL/Format">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <fo:root>
      <fo:layout-master-set>
        <fo:simple-page-master master-name="A4" page-height="29.7cm" page-width="21cm" margin="2cm">
          <fo:region-body/>
        </fo:simple-page-master>
      </fo:layout-master-set>
      <fo:page-sequence master-reference="A4">
        <fo:flow flow-name="xsl-region-body">
          <xsl:apply-templates select="//Form/*"/>
        </fo:flow>
      </fo:page-sequence>
    </fo:root>
  </xsl:template>

  <xsl:template match="Step">
    <fo:block font-size="16pt" font-weight="bold" space-before="12pt" space-after="6pt">
      <xsl:value-of select="@title"/>
    </fo:block>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="Field">
    <fo:table width="100%" space-before="3pt" space-after="3pt" border-bottom="1pt solid #CCCCCC">
      <fo:table-column column-width="50%"/>
      <fo:table-column column-width="50%"/>
      <fo:table-body>
        <fo:table-row>
          <fo:table-cell padding-top="3pt" padding-bottom="3pt">
            <fo:block><xsl:value-of select="@label"/></fo:block>
          </fo:table-cell>
          <fo:table-cell padding-top="3pt" padding-bottom="3pt">
            <xsl:apply-templates/>
          </fo:table-cell>
        </fo:table-row>
      </fo:table-body>
    </fo:table>
  </xsl:template>

  <xsl:template match="StringValue">
    <fo:block space-after="3pt"><xsl:value-of select="."/></fo:block>
  </xsl:template>

  <xsl:template match="Array">
    <fo:block font-size="14pt" font-weight="bold" space-before="9pt" space-after="4pt">
      <xsl:value-of select="@title"/>
    </fo:block>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="ArrayItem">
    <fo:block border-left="1pt solid black" padding-left="6pt" margin-left="3pt" space-before="6pt" space-after="6pt">
      <fo:block font-weight="bold">
        <xsl:value-of select="@title"/>
      </fo:block>
      <xsl:apply-templates/>
    </fo:block>
  </xsl:template>

  <xsl:template match="NoneValue">
    <fo:block>None</fo:block>
  </xsl:template>

</xsl:stylesheet>`

  it('should render a PDF using Apache FOP that matches the snapshot x', async () => {
    const result = await renderApacheFopPdf(xmlString, xslString)

    await expectPdfToMatchSnapshot(result)
  }, 10000)
})
