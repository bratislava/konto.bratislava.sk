# Formulare Support

V tomto dokumente sa posnazim popisat veci ku podpore pre formualre, ktore sa z casu na cas zasekavaju a treba ich pravidelne odsekavat.

## Stavy formularov

Formulare ma nastarosti hlavne [nest-forms-backend](https://github.com/bratislava/konto.bratislava.sk/tree/master/nest-forms-backend) Kazdy formular ma niekolko stavov, pre aktulnost si kukni: [schema.prisma](https://github.com/bratislava/konto.bratislava.sk/blob/c0332af5d71159a0a42dd20ce9a386b2279bf912/nest-forms-backend/prisma/schema.prisma#L66)

- `DRAFT` - ked si uzivatel ulozi formular
- `QUEUED` - ked sa formular odosle od uzivatela ku nam
- `DELIVERED_NASES` - ked sa formular odosle uspesne na nases
- `DELIVERED_GINIS` - ked sa formular uspesne dostane do ginisu
- `SENDING_TO_SHAREPOINT` - pre formulare na najomne byvanie dotecie do sharepoinut
- `PROCESSING` - ked formular uz pristal na "spravnom stole" a uz ho spracovava prislusne oddelnie
- `FINISHED` - ked odelenie uspesne spracovalo formular
- `REJECTED` - ked oddelenie odmietlo formulat
- `ERROR` - ked vznikol po ceste nejaky errror

Od momentu kedy je formulár `QUEUED` kým nedôjde do niektorého z koncových stavov sa formulár spracúva ako správa v RabbitMQ, do ktorého je nest-forms-backend producerom aj consumerom. Pri jednom kroku spracovania z queue vyberie id formulára ktorý sa spracúva, pokúsi vykonať krok ktorý formulár posunie do ďalšieho stav - ak sa mu to podarí upraví stav, ak nie ostane v rovnakom v akom sa nachádzal, a v oboch prípadoch formulár opäť vloží do queue s oneskorením niekoľko sekúnd, príp. minút (detaily implementácie [nases-consumer.service.ts](https://github.com/bratislava/konto.bratislava.sk/blob/c0332af5d71159a0a42dd20ce9a386b2279bf912/nest-forms-backend/src/nases-consumer/nases-consumer.service.ts)). Stavy `PROCESSING` a `FINISHED` sú "koncové" stavy - keď sa formulár dostane do nich, je úspešne podaný a náš backend ho prestáva spracúvať - je teda vyňatý z RabbitMQ queue.

V ramci posielania formularu do ginisu mame dalsie moznosti stavov. Pre aktualne si kukni: [schema.prisma](https://github.com/bratislava/konto.bratislava.sk/blob/c0332af5d71159a0a42dd20ce9a386b2279bf912/nest-forms-backend/prisma/schema.prisma#L49) Kedze ginis nema pre nas nejake rozumne API, tak formular sa posiela do ginisu cez "klikacku" [ginis-automation](https://github.com/bratislava/ginis-automation) ktora vyuziva selenium a manualne tam robi kroky, ako keby ich robil pouzivatel. Bohuzial je to velmi nespolahlive, napriklad ked sa aktualizuje ginis, tak klikacka nie vzdy spravne funguje a musi sa tiez aktualizovat. Z tohto dovodu mame samostatnu rabbit mq ktora sluzi na menezement pridavania formularu do ginisu.

### Podme si popisat jednotlive stavy:

- `CREATED` - formular bol vytvoreny a pridany do klikackovej queue
- `RUNNING_REGISTER` - registrujeme formular cez podatelnu
- `REGISTERED` - formular bol registrovany
- `RUNNING_UPLOAD_ATTACHMENTS` - spusta sa upload priloh
- `ATTACHMENTS_UPLOADED` - prilohy uploadnue
- `RUNNING_EDIT_SUBMISSION` - upravuje sa podanie
- `SUBMISSION_EDITED` - podanie upravene
- `RUNNING_ASSIGN_SUBMISSION` - priraduje sa formular oddeleniu
- `SUBMISSION_ASSIGNED` - odelenie priradene
- `FINISHED` - skoncene
- `ERROR_REGISTER` - vznikol error pri registracii podania
- `ERROR_ATTACHMENT_UPLOAD` - vznikol error pri uploade
- `ERROR_EDIT_SUBMISSION` - vznikol error pri editaci podania
- `ERROR_ASSIGN_SUBMISSION` - vznikol error pri priradovani podania.

## Ako najst zaseknuty formular?

Tvoj den by mal zacat pozrenim si statusu formularov v [metabase](https://metabase.bratislava.sk/dashboard/11-forms-dashboard?date_filter=past7days) popripadne v channeli [#metabase-forms](https://inovaciebratislava.slack.com/archives/C07HQGBPNDA)

### Ked si otvoris metabase forms:

Tak v vidis cislo 153, ktore hovori celkovom pocte formularov za to obdobie. Rovnako graf ti ukazuje pocet formularov vytvorenych v danny den.
O riadok nizsie vidis rozne typy formularov. Od komunitnych zahradiek, az pol olo taxi. Najdolezitejsi graf je pre teba stlcpvy dolu v pravo. Tam vidis akurat stavy formularu za poslendych 7 dni. Aby to bolo komplikovaniejsie, niektore formulare maju na nasej strane finalny stav v `DELIVERED_NASES` (napriklad danove prizanania), niektore zase az v stave `PROCESSING`. Stav `FINISHED` znamena ze danne odelenie ukoncilo formular.
Pre kontrolu su pre nas najdolezitejsie stavy `DELIVERED_GINIS` a `DELIVERED_NASES`.
Pri pohlade na stlpce vidime ze jeden formular mame v stave `DELIVERED_GINIS`. Ked si klines na danny stlpec otovri sa ti nove okno:

Tam ti ukaze uz konkretny formular ktory je zaseknuty v stave ginis. V nasom pripade je to formular `2293d2a5-863e-4a07-a16e-d0782f9143ae`. Kliknutim na danny formular sa ti ukaze jeho detail:

Vidime ze je to zavazne stanovisko k investicnej cinnosti co znamena ze `DELIVERED_GINIS` nie je urcite jeho finalny stav. V nasom pripade je to az stav `PROCESSING`. Preto sa kukneme dalej a vidime ze GINIS State je `RUNNING_UPLOAD_ATTACHMENTS` To znamena ze sa formular zasekol na uploadovani priloh do ginisu.

## Ako ho odseknut zasekany formular?

nest-forms-backend ma public IPcku v ramci magistratnej siete `10.10.10.45`

### Ako odskeknut formular zaseknuty v RUNNING_UPLOAD_ATTACHMENTS?

Potrebujeme spustit este raz upload priloh. To dosiahneme tak ze zmenime ginis stav na predchodzi. V nasom pripade ho musime zmenit na `REGISTERED` To treba priamo v databaze.
Po pripojeni na vpn sa pripojime na databazu nest-forms-backend-databasea podla idecka vyhladame pripojny formular.

a v kolonke ginisState zmenime na `REGISTERED`, ulozime a budeme sledovat co sa bude diat.

Teraz by sa to malo znovu dat do stavu `RUNNING_UPLOAD_ATTACHMENTS` a po nejakom case 10-15min by to malo byt hotovo. Uvidime a skontrolujeme.

Teraz sme mali stastie lebo to preslo a skoncilo to v stave `FINISHED`.

### Co robit ked to zostane v stave `REGISTERED` a nepohne sa do stavu `RUNNING_UPLOAD_ATTACHMENTS`?

To znamena ze mame smolu, lebo pravdepdoobne formular vyskocil z queue a treba ho pridat manualne do rabbita. Na to aby si ho mohol vratit potrebujes pristupy ku produkcnemu rabittovi a to cez kubernetes. Ak nemas pristup ku kubernetesu, poziadaj administratora nech ti ho da

#### Ako na to?

najdi spravnu queue v kode - v nasom pripade sa musime pozriet do kodu ku ginisu. Konkretne tu [ginis.service.ts](https://github.com/bratislava/konto.bratislava.sk/blob/master/nest-forms-backend/src/ginis/ginis.service.ts) a prestudovanim kodu zisitime ze v queue co potrebujeme ma nazov `nases_check_delivery`.
Otvor si lens a portforwardni si rabbita. Konkretne port `15672` na tvoj localhost

Ked mas uspesne portforwardnuteho rabbita, tak potrebujes si otvorit jeho administracne rozhranie:

Dovnutra sa prihlasis s menom a heslom. To si vies zistit z envov v kubernetese pre nest-forms-backendpod. Nasledne po prihlasni sa dostatnes do tohto user rozharnia:

otovirs si sekciu Queues:

a najdes si queue ktory potrebujes. V nasom prilade `nases_check_delivery`. Ked nanho kliknes tak sa dostanes na stranku toho queue a ked zaskrollujes nizsie najdes zalozku pubilish message tam budes musiet pridat formular do queue:

Pre korektne pridanie musis vyplnit vsetky fieldy spravne. Prichsytas si json, ktory bude mat takyto obsah. Pozor, kod nizsie nie je valid json, ale je to objekt schema.

```json
{
  formId: form.id,
  tries: 0,
  userData: {
    email: user?.email || null,
    firstName: user?.given_name || null,
  },
}
```

Ked si prichystas json, tak ten pridas do Payload a publishnes message. Nasledne by si mal vidiet ze sa formular zacal hybat. Do headru content type json.

### Co robit ked publishnes formular do zleho queue?

Existuje jeden trik, ktory ti ho umozni celkom jednoducho dat prec. V kode sa nachadza logika, ktora hovori ze ked je formular archivovany, tak ho vyhodi s queue. Konkretne tu: [nases-consumer.service.ts#L82](https://github.com/bratislava/konto.bratislava.sk/blob/c0332af5d71159a0a42dd20ce9a386b2279bf912/nest-forms-backend/src/nases-consumer/nases-consumer.service.ts#L82)

Takze potrebujes formularu nastavit flag ze je archived. Spravis to jednoducho, a to tak ze sa pripojis na databazu nformualrov, najdes si formular a nastavis mu stav archived z `false` na `true`.

Nasledne pockaj par minut a potom vrat stav archived zase na stav `true`.

### Co robit ked sa formular rozbehne z REGISTERED na RUNNING_UPLOAD_ATTACHMENTS a nepohne sa z neho dalej a po hodine je stale na nom?

No moze tam nastat niekolko moznosti, napriklad mohol sa zmenit ginis. Vtedy zacne klikacka hlasit nieco taketo:

```
"ERROR - Ginis consumer - error upload File - response from Ginis automation. File id: aa53deb8-1d7b-4ac0-a93b-145f2f490ca4.","error":"Message: Couldn't find '//input[contains(@name, \"ktgTypPri\")]' element with value 'Všeobecná príloha' Stacktrace: #0 0x56356ad74f83 <unknown> #1 0x56356aa2dcf7 <unknown> #2 0x56356aa7d99e <unknown> #3 0x56356aa7daa1 <unknown> #4 0x56356aac8d64 <unknown> #5 0x56356aaa70dd <unknown> #6 0x56356aac6006 <unknown> #7 0x56356aaa6e53 <unknown> #8 0x56356aa6edd4 <unknown> #9 0x56
```

Couldn't find '//input ... vtedy najlepsie je dat vediet Ondrovi nech sa kukne na klikacku a nech ju updatne. Nasledne ked je ondro done, tak musis kazdy formular manualne vratit do stavu `REGISTERED` a potom ho zase sledovat ci sa rozbehne a ci dojde do stavu `FINISHED` (tieto stavy myslim GINIS State).

Druhy issue co vie nastat je ze klikacka nevie nahrat subor ku formularu do GINISU. Teraz sa dostavas do fazy ze potrebujes ist do GINISU a najst formular.
Vypytaj si od Pinta pristupy do GINISU. Nasledne Si zisti Ginisove cislo pre formular. To najdes v databaze alebo v metabase pod stlpcom GINIS document ID. Ako pri tomto formulary:

Ginis cislo je `MAG0X04VCGUE`. Tak a teraz si mozes vygenerovat URLku k dokumentu pre ginis:
`ginis.bratislava.sk/pod/?c=OpenDetail&ixx1=MAG0X04VCGUE`

Nezabudni ze GINIS si vies pozriet iba ked si pripojeny na VPNke. Na macoch to funguje iba v prehliadaci CHROME. Ked kliknes na ten link dostanes sa do prihlasovania:

Prihlasis sa rovno sa ti otvori okno s dannym podanim:

Najdi si podsekciu Prilohy (komponenty) a klikni na nu. Nasledne klikni na + Pridať Vyroluje sa male menu na nahratie prilohy. Ked je to vyblednute ako v nasom pripade, znamena ze asi uz nejaky zamestnanec klikal v ginise a niekomu ju priradil predtym nez nasa klikacka to spravila.

Vies si to pozriet v historii, kliknutim na time machine (symbol hodin)

pokial niekto chytal dokument pred nasou klikackou podatelna1 tak je to zle. Co robit v takom pripade?
Treba kontaktovať vlastníkov formuláru na strane magistrátu. Ak ide o záväzné stanoviská / stanoviská k inv. činnosti tak máme Teams chat (viď screenshot nižšie, ak nemáš prístup pýtaj si v #bratislavske-konto-a-ziadosti), v prípade ostatných fomrulárov kontaktuj product ownera.

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

### Co robit ked formular je v stave RUNNING_REGISTER?

Skus ho vratit do stavu `CREATED`. Ak zostava v stave `CREATED` tak treba zisit ci bezi klikacka ginis-automation a ak hej tak ho treba asi dat do rabbita, ak ho klikacka nema nikde v logoch (grafana) podla form id.
Ak sa zasekne zase v `RUNNING_REGISTER` tak treba formular pohladat ako vyzera formular v ginise. Vies sa tam kuknut tak ze das vyladavat Dle Veci

kde do veci das form id napriklad `d6d95c0b-18c3-4fa9-aca7-f523de53a9b0` tam si najdes formular a zistis podla historie ze v jakom je stave.

## Stavy formularov ktore su ok

- stanovisko k investicnemu zameru - `PROCESSING` A `FINISHED` je ok
- zavazne stanovisko k investicnej cinnosti - `PROCESSING` A `FINISHED` je ok
- ziadost o najom bytu - `PROCESSING` ? erik rehulka
- priznanie k dani z nehnutelnosti - `DELIVERED_NASES` ok
- olo - email a su v stave `FINISHED`
- predzahradky - `processing`
