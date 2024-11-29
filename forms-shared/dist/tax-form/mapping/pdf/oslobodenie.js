"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oslobodenie = void 0;
const oslobodenieShared_1 = require("../shared/oslobodenieShared");
const udajeODanovnikovi_1 = require("./udajeODanovnikovi");
const oslobodenie = (data) => {
    const mapping = (0, oslobodenieShared_1.oslobodenieShared)(data);
    const udaje = (0, udajeODanovnikovi_1.udajeODanovnikovi)(data);
    return {
        '12_Ico': udaje.Ico,
        '12_RodneCislo1': udaje.RodneCislo1,
        '12_RodneCislo2': udaje.RodneCislo2,
        '12_Obec': mapping.obec,
        '12_chb1': mapping.pozemkyA,
        '12_chb2': mapping.pozemkyB,
        '12_chb3': mapping.pozemkyC,
        '12_chb4': mapping.pozemkyD,
        '12_chb5': mapping.pozemkyE,
        '12_chb6': mapping.pozemkyF,
        '12_chb7': mapping.pozemkyG,
        '12_chb8': mapping.pozemkyH,
        '12_chb9': mapping.pozemkyI,
        '12_chb10': mapping.pozemkyJ,
        '12_chb11': mapping.pozemkyK,
        '12_chb12': mapping.pozemkyL,
        '12_chb13': mapping.stavbyA,
        '12_chb14': mapping.stavbyB,
        '13_chb1': mapping.stavbyC,
        '13_chb2': mapping.stavbyD,
        '13_chb3': mapping.stavbyE,
        '13_chb4': mapping.stavbyF,
        '13_chb5': mapping.bytyA,
        '13_chb6': mapping.bytyB,
        '13_chb7': mapping.bytyC,
        '13_chb8': mapping.bytyD,
        '13_chb9': mapping.bytyE,
        '13_Poznamka': mapping.poznamka,
    };
};
exports.oslobodenie = oslobodenie;
