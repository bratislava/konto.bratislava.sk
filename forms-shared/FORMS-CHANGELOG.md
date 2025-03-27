# Forms Changelog

## Priznanie k dani z nehnuteľností (priznanie-k-dani-z-nehnutelnosti)

### 1.0.1 (10-03-2025 - https://github.com/bratislava/konto.bratislava.sk/pull/2450)

- Made all "telefon" and "email" fields optional

## Žiadosť o stanovisko k investičnému zámeru (stanovisko-k-investicnemu-zameru)

### 1.1.0 (23-03-2025 - https://github.com/bratislava/konto.bratislava.sk/pull/2492)

- Renamed "Investor" to "Stavebník"
- Changed helptext for "Číslo autorizačného osvedčenia" field in "Zodpovedný projektant" step

## Žiadosť o záväzné stanovisko k investičnej činnosti (zavazne-stanovisko-k-investicnej-cinnosti)

### 2.0.0 (26-03-2025 - https://github.com/bratislava/konto.bratislava.sk/pull/2526)

- Added "IČO" field for "Fyzická osoba - podnikateľ" in "Žiadateľ" and "Investor" steps
- Renamed "Kontaktná osoba" to "Oprávnená osoba" for "Právnická osoba" in "Žiadateľ" and "Investor" steps
- Added "Typ oprávnenia" field under "Oprávnená osoba" in "Žiadateľ" and "Investor" steps
- Restructured "Informácie o stavbe" step:
  - Added "ID stavby" field (optional) with helptext
  - Added "Súpisné číslo" field (optional)
  - Added new "Členenie stavby" section with fields: "Hlavná stavba", "Členenie hlavnej stavby", "Hlavná stavba podľa účelu", and "Ostatné stavby"
- Changed step name from "Typ konania na stavenom úrade" to "Typ žiadosti"
- Updated field name from "Typ konania" to "Typ žiadosti"
- Updated options for "Typ žiadosti"
- Changed enum values to use camel case
