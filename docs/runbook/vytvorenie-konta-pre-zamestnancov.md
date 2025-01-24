# Vytvorenie konta pre zamestnancov

Pre vytvorenie zamestnaneckého konta, pre dané oddelenie, treba spraviť niekoľko krokov, pričom je vyžadovaný prístup do databázy a AWS Cognito.

1. Treba sa zaregistrovať cez <https://konto.bratislava.sk/registracia>. Do jednotlivých polí treba zadať:
   1. Typ účtu - Právnická osoba
   2. Email - Ten na ktorý má toto konto vzniknúť.
   3. Obchodné meno - Nezáleží, buď meno danej osoby, alebo názov oddelenia.
   4. Heslo - ľubovoľné, treba si ho zapamätať.
2. Následne treba otvoriť [Cognito](https://eu-central-1.console.aws.amazon.com/cognito/v2/idp/user-pools/eu-central-1_GCBQzfACy/overview?region=eu-central-1) a vyhľadať používateľa podľa emailu. Toho treba:
   1. Najprv overiť cez _Actions -> Confirm account_
   2. cez _Edit_ označiť pri emaili _Mark email address as verified_
   3. Nakoniec stále v _Edit_ rozhraní, konkrétne dole cez _Add attribute_ zmeniť hodnotu custom:tier na IDENTITY_CARD
3. Treba sa následne prihlásiť pod daným emailom do konta, nech je záznam o používateľovi určite v databáze.
4. V kontovej databáze (nest-city-account) treba upraviť 2 hodnoty v tabuľke LegalPerson pre daný záznam, ktorý sa dá vyhľadať podľa emailu alebo externalId, a to konkrétne:
   1. **ico** na Bratislava-OKM (resp. BA-SNB ak ide o sekciu nájomného bývania, prípadne novú skratku pre ešte nepoužité oddelenie)
   2. **birthNumber** na BA-rodne-cislo-X kde X je ešte nepoužitá hodnota (kvôli nepovolenej duplicite RČ), prípadne náhodný string. Napríklad teda BA-rodne-cislo-12.
5. Po uložení treba poslať mail s inštrukciami danej osobe, že konto si vie aktivovať cez zabudnuté heslo na <https://konto.bratislava.sk/zabudnute-heslo> a následne by malo byť možné prihlásiť sa do konta, pričom bude vidieť všetky podania daného oddelenia. Vzor emailu je napísaný nižšie.

### **Vzor emailu**

Dobrý deň,

Vytvoril som Vám prístup do bratislavského konta ([https://konto.bratislava.sk](https://konto.bratislava.sk/)).

Prihlásenie je na stránke <https://konto.bratislava.sk/prihlasenie>, email je Váš bratislavský, na ktorý som poslal tento mail, heslo si treba nastaviť. To sa dá cez “zabudnuté heslo“ na <https://konto.bratislava.sk/zabudnute-heslo>, kde len zadáte email a následne si nastavíte svoje heslo.

Mali by ste vidieť všetky žiadosti podané Vašim oddelením.

V prípade, že by ste mali nejaký problém s prihlásením, alebo hocijaký iný, určite sa ozvite.
