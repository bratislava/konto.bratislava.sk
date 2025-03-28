# Forms Changelog

## Priznanie k dani z nehnuteľností (priznanie-k-dani-z-nehnutelnosti)

### 1.0.1 (10-03-2025 - https://github.com/bratislava/konto.bratislava.sk/pull/2450)

- Made all "telefon" and "email" fields optional

## Žiadosť o stanovisko k investičnému zámeru (stanovisko-k-investicnemu-zameru)

### 1.1.0 (23-03-2025 - https://github.com/bratislava/konto.bratislava.sk/pull/2492)

- Renamed "Investor" to "Stavebník"
- Changed helptext for "Číslo autorizačného osvedčenia" field in "Zodpovedný projektant" step

### 2.0.0 (28-03-2025 - https://github.com/bratislava/konto.bratislava.sk/pull/2537)

- Split "Meno a priezvisko" into separate "Meno" and "Priezvisko" fields
- Changed "E-mail" to "Email" for consistency
- Replaced hardcoded list of katastrálne územia with reference to a centralized enumeration (`esbsKatastralneUzemiaCiselnik`)
- Changed enum values to use camel case

## Žiadosť o záväzné stanovisko k investičnej činnosti (zavazne-stanovisko-k-investicnej-cinnosti)

### 2.0.0 (26-03-2025 - https://github.com/bratislava/konto.bratislava.sk/pull/2526, https://github.com/bratislava/konto.bratislava.sk/pull/2537)

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
- Replaced hardcoded list of katastrálne územia with reference to a centralized enumeration (`esbsKatastralneUzemiaCiselnik`)

## Komunitné záhrady (komunitne-zahrady)

### 2.0.0 (27-03-2025 - https://github.com/bratislava/konto.bratislava.sk/pull/2532)

- Restructured address fields to use separate fields instead of nested objects
- Renamed "predschvalenyPozemok" to "odporucanyPozemok" throughout the form
- Updated "mestskaCast" field to use "Číselník správnych území SR"
- Removed placeholder texts
- Unified "prilohy" steps into a single conditional step
- Updated form structure and validation rules
- Updated help texts and descriptions

## Predzáhradky (predzahradky)

### 2.0.0 (27-03-2025 - https://github.com/bratislava/konto.bratislava.sk/pull/2532)

- Restructured address fields to use separate fields instead of nested objects
- Updated "mestskaCast" field to use "Číselník správnych území SR"
- Made "ine" field optional
- Unified "rozlozenieNova" and "rozlozenieExistujuca" into a single "rozlozenie" field
- Removed placeholder texts
- Updated form structure and validation rules
- Updated help texts and descriptions

## Oznámenie o poplatkovej povinnosti za komunálne odpady (oznamenie-o-poplatkovej-povinnosti-za-komunalne-odpady)

### 1.0.1 (28-03-2025 - https://github.com/bratislava/konto.bratislava.sk/pull/2561)

- Made "Prílohy" field optional
