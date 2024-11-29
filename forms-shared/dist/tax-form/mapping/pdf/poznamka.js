"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poznamka = void 0;
const poznamkaShared_1 = require("../shared/poznamkaShared");
const poznamka = (data, formId) => {
    const mapping = (0, poznamkaShared_1.poznamkaShared)(data, formId);
    return {
        '2_Poznamka': mapping.poznamka,
    };
};
exports.poznamka = poznamka;
