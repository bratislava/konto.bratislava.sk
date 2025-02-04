# Formulare Support

## Stavy formularov

Formulare spracovava [nest-forms-backend](https://github.com/bratislava/konto.bratislava.sk/tree/master/nest-forms-backend). Aktualne stavy su definovane v [schema.prisma](https://github.com/bratislava/konto.bratislava.sk/blob/master/nest-forms-backend/prisma/schema.prisma).

### Hlavne stavy:

- `DRAFT` - ulozeny formular
- `QUEUED` - odoslany formular
- `DELIVERED_NASES` - doruceny na NASES
- `DELIVERED_GINIS` - doruceny do GINISu
- `SENDING_TO_SHAREPOINT` - posiela sa do SharePointu (najomne byvanie)
- `PROCESSING` - spracovava sa oddelenim
- `FINISHED` - spracovany
- `REJECTED` - odmietnuty
- `ERROR` - chyba

Formular sa spracuva cez RabbitMQ od stavu `QUEUED` az po koncove stavy (`PROCESSING`, `FINISHED`).

### GINIS stavy:

- `CREATED` - vytvoreny v queue
- `RUNNING_REGISTER` / `REGISTERED` - registracia cez podatelnu
- `RUNNING_UPLOAD_ATTACHMENTS` / `ATTACHMENTS_UPLOADED` - upload priloh
- `RUNNING_EDIT_SUBMISSION` / `SUBMISSION_EDITED` - uprava podania
- `RUNNING_ASSIGN_SUBMISSION` / `SUBMISSION_ASSIGNED` - priradenie oddeleniu
- `FINISHED` - dokoncene
- `ERROR_*` - rozne chybove stavy

## Riesenie problemov

### Kontrola stavu

1. Kontroluj [metabase](https://metabase.bratislava.sk/dashboard/11-forms-dashboard?date_filter=past7days) alebo #metabase-forms
2. Sleduj hlavne stavy `DELIVERED_GINIS` a `DELIVERED_NASES`

### Zaseknuty formular v GINIS

1. Pripoj sa na VPN
2. Pristup do databazy (IP: 10.10.10.45)
3. Najdi formular podla ID
4. Vrat stav o krok spat (napr. z `RUNNING_UPLOAD_ATTACHMENTS` na `REGISTERED`)
5. Ak sa nepohne, pridaj ho manualne do RabbitMQ queue

### Pridanie do RabbitMQ

1. Port-forward RabbitMQ (port 15672)
2. Prihlasenie do admin rozhrania
3. Queue > `nases_check_delivery`
4. Publish message s JSON:

```json
{
  "formId": "ID_FORMULARA",
  "tries": 0,
  "userData": {
    "email": "EMAIL",
    "firstName": "MENO"
  }
}
```

> Ak potrebujes formular odstranit z queue, nastav mu v databaze `archived: true`. Po par minutach ho vrat spat na `archived: false`.

### Co robit ked formular skonci v SHAREPOINT_ERROR?

Vo veľkej väčšine prípadov je to z toho dôvodu, že používateľ zadal do niektorého poľa dátum s rokom menej ako 1900. Sharepoint z nejakého dôvodu toto neakceptuje ako validný rok, preto toto treba upraviť a zopakovať odoslanie. V prvom rade je teda fajn si pozrieť log toho erroru, ak je tam v dátach naozaj dátum s rokom menej ako 1900, tak je to jasné, v opačnom prípade je treba zreprodukovať odosielanie, čo je popísané nižšie.

Postup pri zlom roku je nasledovný:

1. Otvorím si daný formulár v databáze, a vo `formDataJson` upravím rok tak, aby nebol menej ako 1900. Vo väčšine prípadov stačí zmeniť 18xx -> 19xx, prípadne niekto zabudne dať prvú cifru, teda 9xx -> 19xx.
2. Rovnako tomuto formuláru nastavím `ginisState: SUBMISSION_ASSIGNED`.
3. Otvorím [sharepoint](https://magistratba.sharepoint.com/sites/UsmernovanieInvesticnejCinnosti_prod/_layouts/15/viewlsts.aspx?view=14) a prejdem si všetky tabuľky, z ktorých treba vymazať všetky záznamy pre danú žiadosť, ktoré sa už do sharepointu dostali. Do sharepointu posielame veci postupne, teda sa môže stať, že nejaké záznamy pre túto žiadosť už sú v sharepointe. Stačí v tabuľke vyhľadať záznamy podľa Ginis ID, ak sa tam nejaký nachádza, tak ho treba odstrániť, ak nie, tak netreba robiť nič.
4. Ak je všetko zo sharepointu odstránené a formulár je fixnutý aj so správnym `ginisState`, tak ho stačí hodiť do Ginis queue ako je popísané vyššie. Následne prebehne pokus o odoslanie, ak je všetko v poriadku tak sa dostane do stavu `PROCESSING`.

Ak toto nebol ten problém a roky sú teda všetky v poriadku, tak treba skúšať ďalej. Niekedy sa môže stať, že Sharepoint timeoutne - toto sa stalo asi iba raz, ale v tom prípade treba spraviť rovnaké kroky ako vyššie, len netreba upravovať dáta.

Párkrát sa stalo, že nesedel dátový typ, ktorý bol odoslaný s tým, ktorý bol v sharepointe pre daný stĺpec. Všetky problémy s týmto boli, že bol nastavený príliš malý limit na dĺžku textov. V tom prípade treba zmeniť stĺpec v sharepointe z "jedného riadku textu" na "viac riadkov textu" a znova zopakovať odoslanie.

Ak stále nič nefunguje, tak sa dá zreprodukovať odosielanie aj lokálne. Sharepoint vráti nejaký error log, ktorý je nie vždy veľa hovoriaci, ale vie niekedy pomôcť. Na toto treba mať nejaký tool na posielanie requestov, napríklad postman.

1. Na toto treba získať bearer token. Treba si nastaviť env hodnoty `SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_DOMAIN, SHAREPOINT_URL` na produkčné hodnoty a nejak lokálne zavolať `getAccessToken` v `sharepoint.subservice`. Funkcia vráti access token, s ktorým vieme simulovať potom posielanie do sharepointu.
2. V logoch je vidno, že do akej tabuľky/zoznamu zlyhalo odoslanie, má to tvar `dtb_NajomneByvanie...` a aj aké dáta sa tam poslali.
3. Ak je napríklad tabuľka `dtb_NajomneByvanieZiadatel`, tak budeme posielať POST request na `https://magistratba.sharepoint.com/sites/UsmernovanieInvesticnejCinnosti_prod/_api/web/lists/getbytitle('dtb_NajomneByvanieZiadatel')/items`. Pre iný zoznam stačí samozrejme zmeniť za iný v url v `getbytitle`.
4. Autorizujeme sa bearer tokenom ktorý máme z prvého kroku.
5. Do body dáme posielané dáta z logov v JSON formáte, teda

```json
{
  "GinisID": "MAG0X04WAYYY",
  "KontaktovanyEmailom": true,
  "ZiadatelMeno": "Erik",
  ...
}
```

6. Tento request odošleme a v odpovedi dostaneme buď success, alebo error s nejakým popisom, sharepoint bohužiaľ nevracia detailné errory.

Podľa tohoto sa dá zistiť kde bola chyba. Nie všetky polia musia byť vyplnené, teda viem poslať len podmnožinu dát. Takto sa dá zistiť kde je chyba, request sa dá poslať viackrát (treba pregenerovať token keď vyprší) s rôznymi dátami, ak niečo nepošlem a zrazu to prejde, tak problém bol v nejakom poli čo som neposlal. Na konci samozrejme treba všetky tieto záznamy vymazať, až potom môžeme zopakovať odoslanie celej žiadosti cez ginis queue.

Nemôžeme meniť ale dáta, ktoré majú vplyv na bodovanie, teda napr. diagnózy, dĺžka bytovej núdze a podobne.

### Dalsie problemy

- **Chyba klikacky**: Kontaktuj Ondra pre update
- **SHAREPOINT_ERROR**: Kontaktuj Erika Řehulku
- **Problem s GINIS**: Skontroluj v GINIS podla cisla `MAG0X*` na `ginis.bratislava.sk/pod/?c=OpenDetail&ixx1=CISLO`

### Akceptovatelne koncove stavy

- Stanovisko/zavazne stanovisko k investicnej cinnosti: `PROCESSING`, `FINISHED`
- Najom bytu: `PROCESSING`
- Danove priznanie: `DELIVERED_NASES`
- OLO: `FINISHED` (email)
- Predzahradky: `PROCESSING`
