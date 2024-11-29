"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prilohyShared = void 0;
const functions_1 = require("./functions");
const oslobodenieShared_1 = require("./oslobodenieShared");
const prilohyShared = (data) => {
    const pocty = (0, functions_1.getPocty)(data);
    return {
        oddiel2: pocty.pocetPozemkov,
        oddiel3: pocty.pocetStaviebJedenUcel + pocty.pocetStaviebViacereUcely,
        oddiel4: pocty.pocetBytov,
        zobrazitOslobodenie: (0, oslobodenieShared_1.zobrazitOslobodenie)(data),
    };
};
exports.prilohyShared = prilohyShared;
