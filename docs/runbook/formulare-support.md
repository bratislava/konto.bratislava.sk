# Formuláre Support

## Stavy formulárov

Formuláre spracováva [nest-forms-backend](https://github.com/bratislava/konto.bratislava.sk/tree/master/nest-forms-backend). Aktuálne stavy sú definované v [schema.prisma](https://github.com/bratislava/konto.bratislava.sk/blob/master/nest-forms-backend/prisma/schema.prisma).

### Hlavné stavy:

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

### GINIS stavy:

- `CREATED` - vytvorený v queue
- `RUNNING_REGISTER` / `REGISTERED` - registrácia cez podateľňu
- `RUNNING_UPLOAD_ATTACHMENTS` / `ATTACHMENTS_UPLOADED` - upload príloh
- `RUNNING_EDIT_SUBMISSION` / `SUBMISSION_EDITED` - úprava podania
- `RUNNING_ASSIGN_SUBMISSION` / `SUBMISSION_ASSIGNED` - priradenie oddeleniu
- `FINISHED` - dokončené
- `ERROR_*` - rôzne chybové stavy

## Riešenie problémov

### Kontrola stavu

1. Kontrolovať [metabase](https://metabase.bratislava.sk/dashboard/11-forms-dashboard?date_filter=past7days) alebo #metabase-forms
2. Sledovať hlavne stavy `DELIVERED_GINIS`, `DELIVERED_NASES`, `SENDING_TO_SHAREPOINT`, v prípade daní `SENDING_TO_NASES`

### Zaseknutý formulár v GINIS

1. Pripojiť sa na VPN
2. Pristúpiť do databázy (IP: 10.10.10.45)
3. Nájsť formulár podľa ID
4. Vrátiť stav o krok späť (napr. z `RUNNING_UPLOAD_ATTACHMENTS` na `REGISTERED`)
5. Ak sa nepohne, pridať ho manuálne do RabbitMQ queue

### Pridanie do RabbitMQ

1. Port-forward RabbitMQ (port 15672)
2. Prihlásenie do admin rozhrania
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

> Pre odstránenie formulára z queue nastav v databáze `archived: true`. Po tom čo v logoch (Grafana) pribudne záznam o tom, že formulár bol spracovaný (= vyhodený), nastav `archived: false`.

### Ďalšie problémy

- **Chyba klikačky**: Kontaktovať maintainera https://github.com/bratislava/ginis-automation
- **SHAREPOINT_ERROR**: Kontaktovať Erika Řehulku
- **Problém s GINIS**: Skontrolovať v GINIS podľa čísla `MAG0X*` na `ginis.bratislava.sk/pod/?c=OpenDetail&ixx1=CISLO`

### Akceptovateľné koncové stavy

- Stanovisko/záväzné stanovisko k investičnej činnosti: `PROCESSING`, `FINISHED`
- Nájom bytu: `PROCESSING`
- Daňové priznanie: `DELIVERED_NASES`
- OLO: `FINISHED` (email)
- Predzáhradky: `PROCESSING`
