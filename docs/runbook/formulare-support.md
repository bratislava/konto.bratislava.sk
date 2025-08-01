# Formuláre Support

<!-- TOC -->
- [Formuláre Support](#formuláre-support)
  - [Stavy formulárov](#stavy-formulárov)
    - [Hlavné stavy](#hlavné-stavy)
    - [GINIS stavy](#ginis-stavy)
    - [Akceptovateľné koncové stavy](#akceptovateľné-koncové-stavy)
  - [Identifikácia a riešenie zaseknutých formulárov](#identifikácia-a-riešenie-zaseknutých-formulárov)
    - [Kontrola stavu](#kontrola-stavu)
    - [Zaseknutý formulár v `RUNNING_UPLOAD_ATTACHMENTS`](#zaseknutý-formulár-v-running_upload_attachments)
    - [Zaseknutý formulár v `RUNNING_REGISTER`](#zaseknutý-formulár-v-running_register)
    - [Zaseknutý formulár v `ERROR_ASSIGN_SUBMISSION`](#zaseknutý-formulár-v-error_assign_submission)
      - [Preskočenie priradenia](#preskočenie-priradenia)
    - [Zaseknutý formulár v `SHAREPOINT_SEND_ERROR`](#zaseknutý-formulár-v-sharepoint_send_error)
      - [Postup pri zlom roku](#postup-pri-zlom-roku)
      - [Možnosti postupu pri inom probléme](#možnosti-postupu-pri-inom-probléme)
  - [Pomocné úkony pri riešení problémov](#pomocné-úkony-pri-riešení-problémov)
    - [Kontrola Ginis logov z `nest-forms-backend`](#kontrola-ginis-logov-z-nest-forms-backend)
    - [Pridanie do RabbitMQ](#pridanie-do-rabbitmq)
    - [Odstránenie z RabbitMQ](#odstránenie-z-rabbitmq)
    - [Kontrola v Ginise](#kontrola-v-ginise)
      - [Kontrola podania v Ginise](#kontrola-podania-v-ginise)
      - [Kontrola formulára v Ginise](#kontrola-formulára-v-ginise)
      - [Kontrola vlastnosti `FormId` v Ginise](#kontrola-vlastnosti-formid-v-ginise)
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
   - ak nie, ostane v rovnakom stave alebo sa presunie do error stavu
3. formulár opäť vloží do queue s oneskorením niekoľko sekúnd, príp. minút

### GINIS stavy

- `CREATED` - vytvorený v queue
- `RUNNING_REGISTER` / `REGISTERED` - registrácia cez podateľňu
- `RUNNING_UPLOAD_ATTACHMENTS` / `ATTACHMENTS_UPLOADED` - upload príloh
- `RUNNING_EDIT_SUBMISSION` / `SUBMISSION_EDITED` - úprava podania – aktuálne sa nepoužíva, lebo nie je potrebná žiadna úprava podania v tejto chvíli (2025-06-24)
- `RUNNING_ASSIGN_SUBMISSION` / `SUBMISSION_ASSIGNED` - priradenie oddeleniu
- `FINISHED` - dokončené
- `ERROR_*` - rôzne chybové stavy

Stavy `RUNNING_*` boli potrebné z historických dôvodov, lebo všetky operácie boli vykonávané asynchrónne. Teraz sú, s výnimkou `RUNNING_REGISTER`, takmer nepotrebné a pomáhajú najmä pri manuálnej kontrole a oprave zaseknutých formulárov v databáze. V rámci Q3 2025 sa plánuje prechod z RabbitMQ na BullMQ, čo by malo prispieť k väčšej spoľahlivosti spracovania formulárov. To by za následok malo takmer eliminovať potrebu formuláre kontrolovať a opravovať, a preto by malo byť možné tieto stavy zjednodušiť.

### Akceptovateľné koncové stavy

- Stanovisko k investičnému zámeru / Záväzné stanovisko k investičnej činnosti: `PROCESSING`, `FINISHED`
- Nájom bytu: `PROCESSING`
- Daňové priznanie: `DELIVERED_NASES`
- OLO: `FINISHED` (email)
- TSB: `FINISHED` (email)
- Predzáhradky / Komunitné záhrady: `PROCESSING`
- Oznámenie o poplatkovej povinnosti za komunálne odpady: `PROCESSING`, `FINISHED`, `REJECTED`
- Žiadosť o slobodný prístup k informáciám: `PROCESSING`, `FINISHED`

## Identifikácia a riešenie zaseknutých formulárov

### Kontrola stavu

1. Kontrolovať [metabase Forms dashboarde](https://metabase.bratislava.sk/dashboard/11-forms-dashboard?date_filter=past7days), `#metabase-forms` v Slacku, alebo priamo databázu.
2. Sledovať hlavné stavy `DELIVERED_GINIS`, `SENDING_TO_SHAREPOINT`, v prípade daní `QUEUED`.
3. Sledovať Ginis stav `RUNNING_REGISTER` (hlavný stav `DELIVERED_NASES`) - prípustné trvanie je cca do 3 hodín.
4. Sledovať `ERROR` stavy, aj ak sú len `DRAFT` formuláre (najmä pri dani z nehnuteľnosti).

Treba brať ohľad na to, kedy boli formuláre odoslané. Ak sú odoslané nedávno, tak sa budú nachádzať v týchto stavoch aj keď je všetko v poriadku, lebo je to súčasť procesu. Treba riešiť, ak sa formulár nachádza v ľubovoľnom z vymenovaných stavov aspoň hodinu (ak nie je špecifikované inak).

### Zaseknutý formulár v `RUNNING_UPLOAD_ATTACHMENTS`

1. Pristúpiť do `nest-forms-backend` databázy (IP: `10.10.10.45`)
2. Nájsť formulár v tabuľke `Forms` podľa `id` (alebo `ginisDocumentId`)
3. Nájsť všetky súbory daného formulára v tabuľke `Files` podľa `formId` (pozor, použiť `id`, nie `ginisDocumentId`)
4. Ak sú nejaké súbory s `true` flagom `ginisUploadedError`, tak treba [skontrolovať prílohy priamo v Ginise](#kontrola-formulára-v-ginise) a manuálne v DB nastaviť `ginisUploaded` na `true` pre všetky súbory, čo sú v Ginise, a na `false` pre ostatné. Potom nastaviť **všetky** `ginisUploadedError` na `false`.
5. Vrátiť `ginisState` späť na `REGISTERED`.
6. Ak sa odtiaľ nepohne, [skontrolovať logy](#kontrola-ginis-logov-z-nest-forms-backend), a ak sa nenachádza v queue, [pridať ho manuálne do RabbitMQ queue](#pridanie-do-rabbitmq).
7. Ak sa pohne opäť do `RUNNING_UPLOAD_ATTACHMENTS`, ale súbory sa stále nenahrávajú, treba skontrolovať [errory v grafane](#kontrola-ginis-logov-z-nest-forms-backend).

### Zaseknutý formulár v `RUNNING_REGISTER`

1. Skontrolovať, či sa [podanie nachádza v Ginise](#kontrola-podania-v-ginise) pre formulár s týmto `id`. Ak nie, čakať a skúsiť znova neskôr
2. Ak áno, [skontrolovať logy](#kontrola-ginis-logov-z-nest-forms-backend), a ak sa nenachádza v queue, [pridať ho manuálne do RabbitMQ queue](#pridanie-do-rabbitmq).
3. Ak sa formulár pravidelne spracúva v rámci queue aj sa nachádza v ginise ale nevie sa spárovať, treba [skontrolovať vlastnosti `FormId` v Ginise](#kontrola-vlastnosti-formid-v-ginise).

### Zaseknutý formulár v `ERROR_ASSIGN_SUBMISSION`

1. [Skontrolovať logy](#kontrola-ginis-logov-z-nest-forms-backend).
2. Ak sa Ginis sťažuje na niečo v zmysle, že:

   > Akci nelze realizovat. Nejste oprávněným vlastníkem.

   tak treba [preskočiť priradenie](#preskočenie-priradenia).

#### Preskočenie priradenia

Ak tlačidlo `Priradiť` po [kontrole priamo v Ginise](#kontrola-formulára-v-ginise) nie je dostupné, pomocou ginis API už nie je možné priradiť vlastníka dokumentu (lebo už je vlastníkom niekto iný). Vtedy treba:

1. Zmeniť v DB `ginisState` na `SUBMISSION_ASSIGNED`, `error` na `NONE` a `state` na `DELIVERED_GINIS`.
2. Ak sa zo `SUBMISSION_ASSIGNED` nepohne, [skontrolovať logy](#kontrola-ginis-logov-z-nest-forms-backend), a ak sa nenachádza v queue, [pridať ho manuálne do RabbitMQ queue](#pridanie-do-rabbitmq).

### Zaseknutý formulár v `SHAREPOINT_SEND_ERROR`

Najčastejšie kvôli dátam, kde je dátum s rokom menej ako 1900. Sharepoint toto neakceptuje ako validný rok, preto ho treba upraviť a zopakovať odoslanie. Treba si pozrieť log toho erroru, ak je tam v dátach naozaj dátum s rokom menej ako 1900, tak je to jasné. V opačnom prípade je treba zreprodukovať odosielanie, čo je popísané nižšie.

#### Postup pri zlom roku

1. Otvoriť si daný formulár v databáze, a vo `formDataJson` upraviť rok tak, aby nebol menej ako 1900. Vo väčšine prípadov stačí zmeniť `18xx` -> `19xx` alebo `xx` -> `19xx`.
2. Nastaviť `ginisState` na `SUBMISSION_ASSIGNED`.
3. Otvoriť [SharePoint](https://magistratba.sharepoint.com/sites/UsmernovanieInvesticnejCinnosti_prod/_layouts/15/viewlsts.aspx?view=14) a prejsť si všetky tabuľky, z ktorých treba vymazať všetky záznamy pre danú žiadosť, ktoré sa už do SharePointu dostali. Do SharePointu posielame veci postupne, teda sa môže stať, že nejaké záznamy pre túto žiadosť už sú v SharePointe. Treba v každej tabuľke vyhľadať záznamy podľa Ginis ID a odstrániť ich.
4. Pridať formulár manuálne do rabbita, viď [Pridanie do RabbitMQ](#pridanie-do-rabbitmq).

Následne prebehne pokus o odoslanie, ak je všetko v poriadku tak sa dostane do stavu `PROCESSING`.

#### Možnosti postupu pri inom probléme

Niekedy sa môže stať, že SharePoint timeoutne – v tom prípade treba vykonať [Postup pri zlom roku](#postup-pri-zlom-roku) od kroku 2 (teda netreba upravovať dáta).

Párkrát sa stalo, že nesedel dátový typ, ktorý bol odoslaný s tým, ktorý bol v SharePointe pre daný stĺpec. Všetky problémy s týmto boli, že bol nastavený príliš malý limit na dĺžku textov. V tom prípade treba zmeniť stĺpec v SharePointe z "jedného riadku textu" na "viac riadkov textu" a znova zopakovať odoslanie.

Ak stále nič nefunguje, tak sa dá zreprodukovať odosielanie aj lokálne. Sharepoint vráti nejaký error log, ktorý je nie vždy veľa hovoriaci, ale vie niekedy pomôcť. Na toto treba mať nejaký tool na posielanie requestov, napríklad postman.

1. Na toto treba získať bearer token. Treba si nastaviť env hodnoty `SHAREPOINT_TENANT_ID`, `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET`, `SHAREPOINT_DOMAIN`, `SHAREPOINT_URL` na produkčné hodnoty a lokálne zavolať `getAccessToken` v `sharepoint.subservice`. Funkcia vráti bearer token, s ktorým možno simulovať posielanie do SharePointu.
2. V logoch vidieť, do akej tabuľky/zoznamu zlyhalo odoslanie – má to tvar `dtb_NajomneByvanie...` - aj aké dáta sa tam poslali.
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

6. Odoslať tento request. Odpoveď bude buď `success`, alebo `error` s _nejakým_ popisom – bohužiaľ, sharepoint nevracia detailné errory.

Podľa tohto sa dá zistiť kde bola chyba:

- nie všetky polia musia byť vyplnené – možno poslať aj len podmnožinu dát
- request sa dá poslať viackrát (treba pregenerovať token keď vyprší) s rôznymi dátami
- ak sú nejaké hodnoty vynechané a request prejde úspešne, tak je problém zrejme v jednej z týchto vynechaných hodnôt

Na konci treba všetky tieto záznamy vymazať, a až potom zopakovať odoslanie celej žiadosti cez ginis queue – rovnako ako pri [postupe pri zlom roku](#postup-pri-zlom-roku) od kroku 2.

> [!IMPORTANT]
> Pri akejkoľvek oprave finálnych dát však nemožno meniť dáta, ktoré majú vplyv na bodovanie, teda napr. diagnózy, dĺžka bytovej núdze a podobne.

## Pomocné úkony pri riešení problémov

### Kontrola Ginis logov z `nest-forms-backend`

Logy sú [dostupné v Grafane](https://grafana.bratislava.sk/explore?schemaVersion=1&panes=%7B%2226p%22:%7B%22datasource%22:%22ae2xijssitedce%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22datasource%22:%7B%22type%22:%22loki%22,%22uid%22:%22ae2xijssitedce%22%7D,%22editorMode%22:%22builder%22,%22expr%22:%22%7Bapp%3D%5C%22nest-forms-backend%5C%22,%20cluster%3D%5C%22tkg-innov-prod%5C%22%7D%20%7C%3D%20%60%60%20%7C%20label_format%20raw%3D%60%7B%7B__line__%7D%7D%60%20%7C%20decolorize%20%7C%20logfmt%20%7C%20line_format%20%60%7B%7B.raw%7D%7D%60%20%7C%20drop%20raw%20%7C%20context%20%3D%20%60GinisService%60%22,%22intervalMs%22:1000,%22maxDataPoints%22:43200,%22queryType%22:%22range%22%7D%5D,%22range%22:%7B%22from%22:%22now-24h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1), pričom `context` je v tomto prípade `GinisService`.

Query pre Loki:

```js
{app="nest-forms-backend", cluster="tkg-innov-prod"} |= `` | label_format raw=`{{__line__}}` | decolorize | logfmt | line_format `{{.raw}}` | drop raw | context = `GinisService`
```

Pre kontrolu konkrétneho formulára stačí zadať jeho `id` do `Line contains` / `Text to find` a zvoliť adekvátny časový interval.

> [!CAUTION]
> V týchto logoch sa vyskytujú aj `debug` level logy o konzumovaní formulárov z rabbit queue obsahujúce `id` formuláru. **Ak sa takéto logy o konzumácii formuláru pravidelne vyskytujú, tak je formulár stále v rabbit queue** a je odtiaľ konzumovaný a pridávaný naspäť.

Pri kontrole errorov je možné filtrovať len errory pomocou `Label filter expression` s hodnotami `severity` = `ERROR` alebo pridaním nasledovnej časti na koniec predošlej Loki Query:

```js
| severity = `ERROR`
```

> [!TIP]
> Ak je z erroru zjavné, že problém nie je na našej strane, a pri opakovanom spracúvaní sa ten istý error opakuje, tak treba kontaktovať správcu Ginisu, čo je vedúci Referátu registratúry.

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

> [!NOTE]
> Po úspešnom pridaní formuláru do queue sa zobrazí potvrdenie, ale všetky údaje zostanú naďalej vyplnené. To je v poriadku, **neklikať znova** na Publish message.

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

1. Pristúpiť cez URL podľa ginis ID `MAG0X*` - napr. `MAG0X1234567` cez <https://ginis.bratislava.sk/usu/?c=OpenDetail&ixx1=MAG0X1234567> – zmeniť ginis ID v URL.
2. _(podľa potreby)_ Kliknúť na `Prílohy (komponenty)` a skontrolovať počet príloh a ich názvy.
3. _(podľa potreby)_ Kliknúť na `Doručenie` a skontrolovať `Identifikátor správy`, ktorý má byť totožný s naším `id` pre formulár v DB.
4. _(podľa potreby)_ Skontrolovať, či je tlačidlo `Priradiť` dostupné. Nachádza sa vpravo hore – je to ikonka hlavy a ramien človeka so šípkou orientovanou sprava doľava ukazujúcou na krk toho človeka. Keď sa myš presunie na túto ikonku, tak sa objaví nápis "Priradiť". Aby bola akcia priradenia dostupná, musí byť toto tlačidlo čierne (teda nie celé šedivé).

#### Kontrola vlastnosti `FormId` v Ginise

1. Otvoriť dokument v ginise:
   - nájsť riadok s podaním podľa postupu [kontroly podania v Ginise](#kontrola-podania-v-ginise) a dvojklikom naň ho otvoriť alebo
   - otvoriť pomocou [kontroly formulára v Ginise](#kontrola-formulára-v-ginise)
2. Kliknúť na `Popisné vlastnosti` (cca uprostred obrazovky, vpravo v tom istom riadku ako `Dokument - registratúrny záznam` a `Prílohy (komponenty)`).
3. Overiť, či sa tam nachádza vlastnosť `FormId` a či je jej hodnota totožná s `id` formulára.
