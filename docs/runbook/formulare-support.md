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
