"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSlovenskoSkXml = void 0;
const xml2js_1 = require("xml2js");
const buildSlovenskoSkXml = (xmlObject, { headless, pretty, }) => {
    const builder = new xml2js_1.Builder({
        xmldec: {
            version: '1.0',
            encoding: 'UTF-8',
        },
        renderOpts: {
            pretty,
        },
        headless,
    });
    return builder.buildObject(xmlObject);
};
exports.buildSlovenskoSkXml = buildSlovenskoSkXml;
