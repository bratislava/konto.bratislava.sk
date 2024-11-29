"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaxFormPdfMapping = void 0;
const oddiel2_1 = require("./oddiel2");
const oddiel3JedenUcel_1 = require("./oddiel3JedenUcel");
const oddiel3ViacereUcely_1 = require("./oddiel3ViacereUcely");
const oddiel4_1 = require("./oddiel4");
const oslobodenie_1 = require("./oslobodenie");
const poznamka_1 = require("./poznamka");
const prilohy_1 = require("./prilohy");
const udajeODanovnikovi_1 = require("./udajeODanovnikovi");
const getTaxFormPdfMapping = (data, formId) => ({
    ...(0, udajeODanovnikovi_1.udajeODanovnikovi)(data),
    ...(0, poznamka_1.poznamka)(data, formId),
    ...(0, prilohy_1.prilohy)(data),
    ...(0, oddiel2_1.oddiel2)(data),
    ...(0, oddiel3JedenUcel_1.oddiel3JedenUcel)(data),
    ...(0, oddiel3ViacereUcely_1.oddiel3ViacereUcely)(data),
    ...(0, oddiel4_1.oddiel4)(data),
    ...(0, oslobodenie_1.oslobodenie)(data),
});
exports.getTaxFormPdfMapping = getTaxFormPdfMapping;
