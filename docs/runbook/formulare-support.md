# Formuláre Support
<!-- TOC -->
* [Formuláre Support](#formuláre-support)
  * [Stavy formulárov](#stavy-formulárov)
    * [Hlavné stavy](#hlavné-stavy)
    * [GINIS stavy](#ginis-stavy)
    * [Akceptovateľné koncové stavy](#akceptovateľné-koncové-stavy)
  * [Identifikácia a riešenie zaseknutých formulárov](#identifikácia-a-riešenie-zaseknutých-formulárov)
    * [Kontrola stavu](#kontrola-stavu)
    * [Zaseknutý formulár v `RUNNING_UPLOAD_ATTACHMENTS`](#zaseknutý-formulár-v-running_upload_attachments)
      * [Preskočenie nahrávania príloh](#preskočenie-nahrávania-príloh)
    * [Zaseknutý formulár v `RUNNING_REGISTE`](#zaseknutý-formulár-v-running_registe)
    * [Zaseknutý formulár v `SHAREPOINT_ERROR`](#zaseknutý-formulár-v-sharepoint_error)
      * [Postup pri zlom roku](#postup-pri-zlom-roku)
      * [Možnosti postupu pri inom probléme](#možnosti-postupu-pri-inom-probléme)
  * [Pomocné úkony pri riešení problémov](#pomocné-úkony-pri-riešení-problémov)
    * [Pridanie do RabbitMQ](#pridanie-do-rabbitmq)
    * [Odstránenie z RabbitMQ](#odstránenie-z-rabbitmq)
    * [Kontrola v Ginise](#kontrola-v-ginise)
      * [Kontrola podania v Ginise](#kontrola-podania-v-ginise)
      * [Kontrola formulára v Ginise](#kontrola-formulára-v-ginise)
    * [Kontrola klikačky](#kontrola-klikačky)
<!-- TOC -->
## Stavy formulárov

Formuláre spracúva [nest-forms-backend](https://github.com/bratislava/konto.bratislava.sk/tree/master/nest-forms-backend). Aktuálne stavy sú definované v [schema.prisma](https://github.com/bratislava/konto.bratislava.sk/blob/master/nest-forms-backend/prisma/schema.prisma).

### Hlavné stavy

- `DRAFT` - uložený formulár
- `QUEUED` - odoslaný formulár
- `DELIVERED_NASES` - doručený na NASES
- `DELIVERED_GINIS` - doručený do GINISu
- `SENDING_TO_SHAREPOINT` - posiela sa do SharePointu (nájomné bývanie)
- `PROCESSING` - spracováva sa oddelením
- `FINISHED` - spracovaný
- `REJECTED` - odmietnutý
- `ERROR` - chyba

Formulár sa spracúva cez RabbitMQ od stavu `QUEUED` až po koncové stavy (`PROCESSING`, `FINISHED`).

`nest-forms-backend` je **producer** aj **consumer** tejto queue ([detaily implementácie](https://github.com/bratislava/konto.bratislava.sk/blob/c0332af5d71159a0a42dd20ce9a386b2279bf912/nest-forms-backend/src/nases-consumer/nases-consumer.service.ts)):

1. vyberie id formulára, ktorý sa spracúva z queue
2. pokúsi sa vykonať krok, ktorý formulár posunie do ďalšieho stavu
   - ak sa mu to podarí upraví stav
   - ak nie, ostane v rovnakom stave
3. formulár opäť vloží do queue s oneskorením niekoľko sekúnd, príp. minút

### GINIS stavy

- `CREATED` - vytvorený v queue
- `RUNNING_REGISTER` / `REGISTERED` - registrácia cez podateľňu
- `RUNNING_UPLOAD_ATTACHMENTS` / `ATTACHMENTS_UPLOADED` - upload príloh
- `RUNNING_EDIT_SUBMISSION` / `SUBMISSION_EDITED` - úprava podania
- `RUNNING_ASSIGN_SUBMISSION` / `SUBMISSION_ASSIGNED` - priradenie oddeleniu
- `FINISHED` - dokončené
- `ERROR_*` - rôzne chybové stavy

Ginis historicky nemal potrebné API pre naše potreby. Preto sa formulár zatiaľ posiela do ginisu cez [klikačku](https://github.com/bratislava/ginis-automation), ktorá využíva `selenium` a manuálne tam robí kroky, ako keby ich robil používateľ. Je to veľmi nespoľahlivé, a každý update Ginisu nám klikačku môže pokaziť (a často aj kazí). Z tohto dôvodu máme samostatnú RabbitMQ, ktorá slúži na manažment pridávania formulára do ginisu, pretože [ginis service](https://github.com/bratislava/konto.bratislava.sk/blob/master/nest-forms-backend/src/ginis/ginis.service.ts) musí čakať na kroky vykonané klikačkou.

Tento prístup sa ale aktívne snažíme odstrániť po tom, ako nám Ginis v roku 2025 sprístupnil nové API spĺňajúce všetky naše potreby.

### Akceptovateľné koncové stavy

- Stanovisko/záväzné stanovisko k investičnej činnosti: `PROCESSING`, `FINISHED`
- Nájom bytu: `PROCESSING`
- Daňové priznanie: `DELIVERED_NASES`
- OLO: `FINISHED` (email)
- Predzáhradky: `PROCESSING`

## Identifikácia a riešenie zaseknutých formulárov

### Kontrola stavu

1. Kontrolovať [metabase Forms dashboarde](https://metabase.bratislava.sk/dashboard/11-forms-dashboard?date_filter=past7days) alebo v Slacku `#metabase-forms`
2. Sledovať hlavné stavy `DELIVERED_GINIS`, `DELIVERED_NASES`, `SENDING_TO_SHAREPOINT`, v prípade daní `SENDING_TO_NASES`
3. Sledovať Ginis stav `RUNNING_REGISTER` (najmä keď hlavný stav **nie je** `DELIVERED_GINIS`)
4. Sledovať `ERROR` stavy, aj ak sú len `DRAFT` formuláre (najmä pri dani z nehnuteľnosti)

Treba brať ohľad na to, kedy boli formuláre odoslané. Ak sú odoslané nedávno, tak sa budú nachádzať v týchto stavoch aj keď je všetko v poriadku, lebo je to súčasť procesu. Treba riešiť keď sú v danom stave zaseknuté aspoň hodinu.

### Zaseknutý formulár v `RUNNING_UPLOAD_ATTACHMENTS`

1. Pristúpiť do `nest-forms-backend` databázy (IP: `10.10.10.45`)
2. Nájsť formulár v tabuľke `Forms` podľa `id` (alebo `ginisDocumentId`)
3. Nájsť všetky súbory daného formulára v tabuľke `Files` podľa `formId` (pozor, použiť `id`, nie `ginisDocumentId`)
4. Ak sú nejaké súbory s `true` flagom `ginisUploadedError`, tak treba [skontrolovať prílohy priamo v Ginise](#kontrola-formulára-v-ginise) a manuálne v DB nastaviť `ginisUploaded` na `true` pre **všetky** súbory, čo sú v Ginise, a na `false` pre ostatné. Potom nastaviť **všetky** `ginisUploadedError` na `false`.
   - Ak nie je dostupné tlačidlo `Nová elektronická príloha`, tak treba poslať prílohy manuálne emailom a [preskočiť nahrávanie príloh](#preskočenie-nahrávania-príloh).
5. Vrátiť `ginisState` späť na `REGISTERED`.
6. Ak sa odtiaľ nepohne, [pridať ho manuálne do RabbitMQ queue](#pridanie-do-rabbitmq).
7. Ak sa pohne opäť do `RUNNING_UPLOAD_ATTACHMENTS`, ale súbory nenapredujú (žiadne nové nahratia ani errory) alebo sú po zopakovaní od kroku 4 vždy len tie isté errory, treba [skontrolovať klikačku](#kontrola-klikačky).

#### Preskočenie nahrávania príloh

Ak tlačidlo `Nová elektronická príloha` po [kontrole priamo v Ginise](#kontrola-formulára-v-ginise) nie je dostupné, klikačka už nedokáže nahrať prílohy. Vtedy treba:

1. Isť do [S3 bucketu](https://console.s3.bratislava.sk/browser).
2. Vybrať `forms-prod-safe`.
3. Zvoliť si typ formulára podľa DB hodnoty v `formDefinitionSlug`.
4. Hore vyhľadať `id` formulára a kliknúť na priečinok s tým ID.
5. Vybrať všetky súbory, kliknúť na `Download` a uložiť si `.zip`.
6. Podľa toho aký je to typ formuláru alebo kto je v ginise priradený ako vlastník poslať email, kde bude `id`, `ginisDocumentId`, `.zip` s prílohami a vysvetlenie/ospravedlnenie.
   - Ak ide o záväzné stanoviská / stanoviská k inv. činnosti tak máme Teams chat `ÚHA x Inovácie - standup`.
   - Vždy sa dá aj spýtať product ownerov (kolegov z OI) komu to adresovať podľa toho kto má čo na starosti.
7. Zmeniť `ginisState` na `SUBMISSION_ASSIGNED`.
8. Ak sa odtiaľ nepohne, [pridať ho manuálne do RabbitMQ queue](#pridanie-do-rabbitmq).

### Zaseknutý formulár v `RUNNING_REGISTE`

1. Skontrolovať, či sa [podanie nachádza v Ginise](#kontrola-podania-v-ginise) pre formulár s týmto `id`. Ak nie, čakať a skúsiť znova neskôr
2. Ak áno, zmeniť `ginisState` na `CREATED`.
3. Ak zostane v `CREATED`, overiť a [pridať do Rabbita](#pridanie-do-rabbitmq).
4. Ak sa pohne, ale zasekne opäť v `RUNNING_REGISTER`, tak [skontrolovať klikačku](#kontrola-klikačky).

### Zaseknutý formulár v `SHAREPOINT_ERROR`

Najčastejšie kvôli dátam, kde je dátum s rokom menej ako 1900. Sharepoint toto neakceptuje ako validný rok, preto ho treba upraviť a zopakovať odoslanie. Treba si pozrieť log toho erroru, ak je tam v dátach naozaj dátum s rokom menej ako 1900, tak je to jasné. V opačnom prípade je treba zreprodukovať odosielanie, čo je popísané nižšie.

#### Postup pri zlom roku

1. Otvoriť si daný formulár v databáze, a vo `formDataJson` upraviť rok tak, aby nebol menej ako 1900. Vo väčšine prípadov stačí zmeniť `18xx` -> `19xx` alebo `9xx` -> `19xx`.
2. Nastaviť `ginisState` na `SUBMISSION_ASSIGNED`.
3. Otvoriť [sharepoint](https://magistratba.sharepoint.com/sites/UsmernovanieInvesticnejCinnosti_prod/_layouts/15/viewlsts.aspx?view=14) a prejsť si všetky tabuľky, z ktorých treba vymazať všetky záznamy pre danú žiadosť, ktoré sa už do sharepointu dostali. Do sharepointu posielame veci postupne, teda sa môže stať, že nejaké záznamy pre túto žiadosť už sú v sharepointe. Treba v každej tabuľke vyhľadať záznamy podľa Ginis ID a odstrániť ich.
4. Pridať formulár do rabbita, viď [Pridanie do RabbitMQ](#pridanie-do-rabbitmq).

Následne prebehne pokus o odoslanie, ak je všetko v poriadku tak sa dostane do stavu `PROCESSING`.

#### Možnosti postupu pri inom probléme

Niekedy sa môže stať, že Sharepoint timeoutne - v tom prípade treba vykonať [Postup pri zlom roku](#postup-pri-zlom-roku) od kroku 2 (teda netreba upravovať dáta).

Párkrát sa stalo, že nesedel dátový typ, ktorý bol odoslaný s tým, ktorý bol v sharepointe pre daný stĺpec. Všetky problémy s týmto boli, že bol nastavený príliš malý limit na dĺžku textov. V tom prípade treba zmeniť stĺpec v sharepointe z "jedného riadku textu" na "viac riadkov textu" a znova zopakovať odoslanie.

Ak stále nič nefunguje, tak sa dá zreprodukovať odosielanie aj lokálne. Sharepoint vráti nejaký error log, ktorý je nie vždy veľa hovoriaci, ale vie niekedy pomôcť. Na toto treba mať nejaký tool na posielanie requestov, napríklad postman.

1. Na toto treba získať bearer token. Treba si nastaviť env hodnoty `SHAREPOINT_TENANT_ID`, `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET`, `SHAREPOINT_DOMAIN`, `SHAREPOINT_URL` na produkčné hodnoty a lokálne zavolať `getAccessToken` v `sharepoint.subservice`. Funkcia vráti bearer token, s ktorým možno simulovať posielanie do sharepointu.
2. V logoch vidieť, do akej tabuľky/zoznamu zlyhalo odoslanie - má to tvar `dtb_NajomneByvanie...` - aj aké dáta sa tam poslali.
3. Ak je napr. tabuľka `dtb_NajomneByvanieZiadatel`, tak treba posielať POST request na `https://magistratba.sharepoint.com/sites/UsmernovanieInvesticnejCinnosti_prod/_api/web/lists/getbytitle('dtb_NajomneByvanieZiadatel')/items`. Pre iný zoznam treba zmeniť hodnotu v url v `getbytitle`.
4. Autorizovať sa bearer tokenom z prvého kroku.
5. Do body vložiť posielané dáta z logov v JSON formáte:

   ```json
   {
     "GinisID": "MAG0X04WAYYY",
     "KontaktovanyEmailom": true,
     "ZiadatelMeno": "Erik",
     ...
   }
   ```

6. Odoslať tento request. Odpoveď bude buď `success`, alebo `error` s _nejakým_ popisom - bohužiaľ, sharepoint nevracia detailné errory.

Podľa tohto sa dá zistiť kde bola chyba:

- nie všetky polia musia byť vyplnené - možno poslať aj len podmnožinu dát
- request sa dá poslať viackrát (treba pregenerovať token keď vyprší) s rôznymi dátami
- ak sú nejaké hodnoty vynechané a request prejde úspešne, tak je problém zrejme v jednej z týchto vynechaných hodnôt

Na konci treba všetky tieto záznamy vymazať, a až potom zopakovať odoslanie celej žiadosti cez ginis queue - rovnako ako pri [postupe pri zlom roku](#postup-pri-zlom-roku) od kroku 2.

Pri akejkoľvek oprave finálnych dát však nemožno meniť dáta, ktoré majú vplyv na bodovanie, teda napr. diagnózy, dĺžka bytovej núdze a podobne.

## Pomocné úkony pri riešení problémov

### Pridanie do RabbitMQ

1. Port-forward RabbitMQ (`nest-forms-backend-rabbitmq-server` port 15672)
2. Prihlásiť sa do admin rozhrania
3. Queue > `nases_check_delivery`
4. Rozbaliť menu Publish message, vyplniť nasledovné, kliknúť na tlačidlo Publish message

   **Properties:**  
   `content_type` = `application/json`

   **Payload:**  
   _(nezabudnúť nahradiť `ID_FORMULARA`)_

   ```json
   {
     "formId": "ID_FORMULARA",
     "tries": 0,
     "userData": {
       "email": "",
       "firstName": ""
     }
   }
   ```

_**NOTE:** Po úspešnom pridaní formuláru do queue sa zobrazí potvrdenie, ale všetky údaje zostanú naďalej vyplnené. To je v poriadku, **neklikať znova** na Publish message._

Formulár môže byť najviac v jednej queue a najviac raz. V opačnom prípade ho treba odstrániť (a potom prípadne pridať jedenkrát správne).

### Odstránenie z RabbitMQ

Formulár treba z queue úplne odstrániť ak sa:

- nedopatrením pridá do queue, kde už je
- pridá do queue viackrát
- pridá do zlej queue

Pre odstránenie formulára z queue treba nastaviť v databáze flag `archived` na `true`. Po tom, čo v logoch (Grafana) pribudne záznam o tom, že formulár bol spracovaný (= vyhodený), nastaviť `archived` naspäť na `false`.

### Kontrola v Ginise

Potrebná len pri konkrétnych problémoch s formulármi, nie rutinne.

#### Kontrola podania v Ginise

1. Pristúpiť cez URL <https://ginis.bratislava.sk/pod/> do POD.
2. Navigovať `El. podání` -> `Přehled el. podání`.
3. Zvoliť rozumne krátky interval dátumu v komponente `Filtr dle datumu:` (ideálne nie viac ako 7 dní; ak treba viac, tak potom trpezlivo čakať).
4. Kliknúť na tlačidlo `Načíst`.
5. Pomocou lupy `Hledat v seznamu` filtrovať podania podľa `id` formulára, ktoré je v stĺpci `ID zprávy` (alebo podľa `ginisDocumentId` v stĺpci `Ident. dok./spisu`).

#### Kontrola formulára v Ginise

1. Pristúpiť cez URL podľa ginis ID `MAG0X*` - napr. `MAG0X1234567` cez <https://ginis.bratislava.sk/usu/?c=OpenDetail&ixx1=MAG0X1234567> - zmeniť ginis ID v URL.
2. _(podľa potreby)_ Kliknúť na `Prílohy (komponenty)` a skontrolovať počet príloh a ich názvy.
   - ak sa opakovane nenahrávajú súbory automaticky cez klikačku, skontrolovať, či po kliknutí na `Pridať` je dostupné tlačidlo `Nová elektronická príloha` (teda nie je celé šedivé)
3. _(podľa potreby)_ Kliknúť na `Doručenie` a skontrolovať `Identifikátor správy`, ktorý má byť totožný s naším `id` pre formulár v DB.

### Kontrola klikačky

Logy sú dostupné [v grafane ako `ginis-automation`](https://grafana.bratislava.sk/explore?schemaVersion=1&panes=%7B%224jm%22:%7B%22datasource%22:%22ae2xijssitedce%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22%7Bcluster%3D%5C%22tkg-innov-prod%5C%22,%20app%3D%5C%22ginis-automation%5C%22%7D%20%7C%3D%20%60%60%22,%22queryType%22:%22range%22,%22datasource%22:%7B%22type%22:%22loki%22,%22uid%22:%22ae2xijssitedce%22%7D,%22editorMode%22:%22builder%22%7D%5D,%22range%22:%7B%22from%22:%22now-24h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1).
Z nich sa dá zistiť, či klikačka beží, a či nenastáva nejaká plošná chyba, kvôli ktorej sú v logoch samé errory.

Pre kontrolu konkrétneho formulára stačí zadať jeho `id` do `Line contains` / `Text to find` a zvoliť adekvátny časový interval.

Pri akýchkoľvek problémoch s klikačkou alebo konkrétnych otázok pri analýze formulárového problému treba kontaktovať maintainera <https://github.com/bratislava/ginis-automation>.
