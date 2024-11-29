"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmptyXml = void 0;
const generateXml_1 = require("../generateXml");
const xmlBuilder_1 = require("../xmlBuilder");
const getEmptyXml = (formDefinition) => {
    const emptyXmlObject = (0, generateXml_1.getEmptySlovenskoSkXmlObject)(formDefinition);
    return (0, xmlBuilder_1.buildSlovenskoSkXml)(emptyXmlObject, { headless: false, pretty: true });
};
exports.getEmptyXml = getEmptyXml;
