"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prilohyXml = void 0;
const poznamkaShared_1 = require("../shared/poznamkaShared");
const prilohyShared_1 = require("../shared/prilohyShared");
const prilohyXml = (data) => {
    const mapping = (0, prilohyShared_1.prilohyShared)(data);
    const { poznamka } = (0, poznamkaShared_1.poznamkaShared)(data);
    return {
        SuhrnPriloh: {
            PocetOddielovII: mapping.oddiel2,
            PocetOddielovIII: mapping.oddiel3,
            PocetOddielovIV: mapping.oddiel4,
            PocetOddielovV: 0,
            PocetOddielovVI: 0,
            PocetOddielovVII: 0,
            PocetInych: mapping.zobrazitOslobodenie ? 1 : 0,
            Poznamka: poznamka,
        },
    };
};
exports.prilohyXml = prilohyXml;
