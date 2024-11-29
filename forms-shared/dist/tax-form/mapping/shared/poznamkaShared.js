"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poznamkaShared = void 0;
const statCiselnik_1 = require("../pdf/statCiselnik");
const dates_1 = require("./dates");
const oddiel2Shared_1 = require("./oddiel2Shared");
const oddiel3JedenUcelShared_1 = require("./oddiel3JedenUcelShared");
const oddiel3ViacereUcelyShared_1 = require("./oddiel3ViacereUcelyShared");
const oddiel4Shared_1 = require("./oddiel4Shared");
const udajeODanovnikoviShared_1 = require("./udajeODanovnikoviShared");
const safeData_1 = require("../../../form-utils/safeData");
const formatKeyValueArray = (array) => array
    .map(([key, value]) => [key, (0, safeData_1.safeString)(value)])
    .filter((tuple) => tuple[1] != null)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ');
const bezpodieloveSpoluvlastnictvoManzelovPoznamka = (data) => {
    const anyIsBezpodieloveSpoluvlastnictvo = [
        ...(0, oddiel2Shared_1.oddiel2Shared)(data),
        ...(0, oddiel3JedenUcelShared_1.oddiel3JedenUcelShared)(data),
        ...(0, oddiel3ViacereUcelyShared_1.oddiel3ViacereUcelyShared)(data),
        ...(0, oddiel4Shared_1.oddiel4Shared)(data),
    ].some((priznanie) => priznanie.isBezpodieloveSpoluvlastnictvo);
    if (!anyIsBezpodieloveSpoluvlastnictvo) {
        return null;
    }
    const rovnakaAdresa = (0, safeData_1.safeBoolean)(data.bezpodieloveSpoluvlastnictvoManzelov?.rovnakaAdresa) === true;
    const bezpodieloveSpoluvlastnictvoManzelovAdresa = [
        [
            'Ulica',
            data.bezpodieloveSpoluvlastnictvoManzelov?.ulicaCisloBezpodieloveSpoluvlastnictvoManzelov
                ?.ulica,
        ],
        [
            'Číslo',
            data.bezpodieloveSpoluvlastnictvoManzelov?.ulicaCisloBezpodieloveSpoluvlastnictvoManzelov
                ?.cislo,
        ],
        ['Obec', data.bezpodieloveSpoluvlastnictvoManzelov?.obecPsc?.obec],
        ['PSČ', data.bezpodieloveSpoluvlastnictvoManzelov?.obecPsc?.psc],
        ['Štát', (0, statCiselnik_1.getTitleFromStatCiselnik)(data.bezpodieloveSpoluvlastnictvoManzelov?.stat)],
    ];
    const formatted = formatKeyValueArray([
        ['Rodné číslo', data.bezpodieloveSpoluvlastnictvoManzelov?.rodneCislo],
        ['Titul', data.bezpodieloveSpoluvlastnictvoManzelov?.menoTitul?.titul],
        ['Meno', data.bezpodieloveSpoluvlastnictvoManzelov?.menoTitul?.meno],
        ['Priezvisko', data.bezpodieloveSpoluvlastnictvoManzelov?.priezvisko],
        ...(rovnakaAdresa
            ? [['Má trvalé bydlisko na rovnakej adrese ako žiadateľ?', 'Áno']]
            : bezpodieloveSpoluvlastnictvoManzelovAdresa),
        ['E-mail', data.bezpodieloveSpoluvlastnictvoManzelov?.email],
        ['Telefón', data.bezpodieloveSpoluvlastnictvoManzelov?.telefon],
    ]);
    if (formatted.length === 0) {
        return null;
    }
    return `Údaje o manželovi/manželke:\n${formatted}`;
};
const rodneCisloDatumNarodeniaPoznamka = (data) => {
    const { rodneCislo, datumNarodenia } = (0, udajeODanovnikoviShared_1.udajeODanovnikoviShared)(data);
    if (rodneCislo?.isValid) {
        return null;
    }
    if (datumNarodenia != null) {
        return `Dátum narodenia: ${(0, dates_1.formatDatePdf)(datumNarodenia)}`;
    }
    if (rodneCislo?.value != null) {
        return `Rodné číslo: ${rodneCislo.value}`;
    }
    return null;
};
const korespondencnaAdresaPoznamka = (data) => {
    const korespondencnaAdresaRozdielna = (0, safeData_1.safeBoolean)(data.udajeODanovnikovi?.korespondencnaAdresa?.korespondencnaAdresaRovnaka, false) === false;
    if (!korespondencnaAdresaRozdielna) {
        return null;
    }
    const formatted = formatKeyValueArray([
        ['Ulica', data.udajeODanovnikovi?.korespondencnaAdresa?.ulicaCisloKorespondencnaAdresa?.ulica],
        ['Číslo', data.udajeODanovnikovi?.korespondencnaAdresa?.ulicaCisloKorespondencnaAdresa?.cislo],
        ['Obec', data.udajeODanovnikovi?.korespondencnaAdresa?.obecPsc?.obec],
        ['PSČ', data.udajeODanovnikovi?.korespondencnaAdresa?.obecPsc?.psc],
        ['Štát', (0, statCiselnik_1.getTitleFromStatCiselnik)(data.udajeODanovnikovi?.korespondencnaAdresa?.stat)],
    ]);
    return `Korespondenčná adresa:\n${formatted}`;
};
const poznamkaShared = (data, formId) => {
    const generated = [
        `Tento dokument bol vygenerovaný pomocou Bratislavského konta.`,
        formId ? `ID formulára: ${formId}` : null,
    ]
        .filter(Boolean)
        .join('\n');
    const poznamkaString = [
        rodneCisloDatumNarodeniaPoznamka(data),
        korespondencnaAdresaPoznamka(data),
        bezpodieloveSpoluvlastnictvoManzelovPoznamka(data),
        generated,
    ]
        .filter(Boolean)
        .join('\n\n');
    return { poznamka: poznamkaString };
};
exports.poznamkaShared = poznamkaShared;
