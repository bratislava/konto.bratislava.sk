# Import spôsobu doručenia dane do Norisu

Ukladanie informácie o tom, akým spôsobom si používateľ želá doručiť DzN do Norisu sa momentálne deje manuálne. V tomto dokumente je spísané, odkiaľ sa pre jednotlivých používateľov dá získať informácia o nastavenom spôsobe doručenia.

1. Má overené konto? - tu jednoducho vieme zobrať rodné čísla z databázy nest-city-account, konkrétne tabuľka User.
2. Kedy sa overil? - Rovnako tabuľka User, stĺpec _lastVerificationIdentityCard_.
3. O aké doručenie požiadal? - Ak používateľ požiada o zmenu spôsobu doručenia, je to uložené v tabuľke UserGdprData, konkrétne event s **category = TAXES** a **type = FORMAL_COMMUNICATION**. Ak je posledný event (podľa _createdAt_) **subscribe**, tak požiadal o doručenie do konta, ak **unsubscribe** tak poštou.
4. Má aktívnu el. schránku? - Toto vieme dostať z tabuľky PhysicalEntity podľa rodného čísla, konkrétne stĺpec _activeEdesk_.

Všetko potrebné je teda v databáze, vieme tým pádom tieto informácie dostať do Norisu aj automaticky. Samozrejme ak má používateľ edesk, tak to treba posielať tam, ak nemá tak len vtedy pozeráme na spôsob doručenia pošta/konto.

Konkrétny spôsob (resp. formát) v akom to posielame daniarom teraz ešte budem musieť zistiť, prípadne ak urobíme automatizáciu tak to nebude treba.
