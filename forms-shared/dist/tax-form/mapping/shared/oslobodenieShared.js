"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zobrazitOslobodenie = exports.oslobodenieShared = exports.oslobodenieBooleanShared = void 0;
const safeData_1 = require("../../../form-utils/safeData");
const oslobodenieBooleanShared = (data) => {
    const pozemkyArray = (0, safeData_1.safeArray)(data.znizenieAleboOslobodenieOdDane?.pozemky);
    const stavbyArray = (0, safeData_1.safeArray)(data.znizenieAleboOslobodenieOdDane?.stavby);
    const bytyArray = (0, safeData_1.safeArray)(data.znizenieAleboOslobodenieOdDane?.byty);
    return {
        pozemkyA: false,
        pozemkyB: pozemkyArray.includes('option1'),
        pozemkyC: pozemkyArray.includes('option2'),
        pozemkyD: false,
        pozemkyE: pozemkyArray.includes('option3'),
        pozemkyF: false,
        pozemkyG: false,
        pozemkyH: false,
        pozemkyI: false,
        pozemkyJ: false,
        pozemkyK: pozemkyArray.includes('option4'),
        pozemkyL: false,
        stavbyA: false,
        stavbyB: stavbyArray.includes('option1'),
        stavbyC: false,
        stavbyD: stavbyArray.includes('option2'),
        stavbyE: stavbyArray.includes('option3'),
        stavbyF: false,
        bytyA: false,
        bytyB: false,
        bytyC: false,
        bytyD: bytyArray.includes('option1'),
        bytyE: bytyArray.includes('option2'),
    };
};
exports.oslobodenieBooleanShared = oslobodenieBooleanShared;
const oslobodenieShared = (data) => ({
    obec: 'Bratislava',
    ...(0, exports.oslobodenieBooleanShared)(data),
    poznamka: (0, safeData_1.safeString)(data.znizenieAleboOslobodenieOdDane?.poznamka),
});
exports.oslobodenieShared = oslobodenieShared;
const zobrazitOslobodenie = (data) => {
    const oslobodenieAnyChecked = Object.values((0, exports.oslobodenieBooleanShared)(data)).includes(true);
    const oslobodeniePoznamka = (0, exports.oslobodenieShared)(data).poznamka;
    const oslobodeniePoznamkaNonEmpty = oslobodeniePoznamka && oslobodeniePoznamka.trim() !== '';
    return oslobodenieAnyChecked || oslobodeniePoznamkaNonEmpty;
};
exports.zobrazitOslobodenie = zobrazitOslobodenie;
