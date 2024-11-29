"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaXml = void 0;
const urls_1 = require("../urls");
const xmlBuilder_1 = require("../xmlBuilder");
const getMetaXml = (formDefinition, validFrom) => {
    const metaData = {
        'meta:metadata': {
            $: {
                'xmlns:attachment': 'urn:attachment:1.0',
                'xmlns:manifest': 'urn:manifest:1.0',
                'xmlns:attachmentfile': 'urn:attachmentfile:1.0',
                'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
                'xmlns:setting': 'urn:setting:1.0',
                'xmlns:content': 'urn:content:1.0',
                'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
                'xmlns:presentation': 'urn:presentation:1.0',
                'xmlns:data': 'urn:data:1.0',
                'xmlns:meta': 'urn:meta:1.0',
            },
            'dc:title': formDefinition.title,
            'dc:identifier': (0, urls_1.getSlovenskoSkMetaIdentifier)(formDefinition),
            'dc:description': formDefinition.title,
            'dc:creator': formDefinition.gestor,
            'dc:publisher': formDefinition.publisher,
            'meta:version': formDefinition.pospVersion,
            'meta:language': 'sk',
            'meta:validDateFrom': validFrom,
            'meta:inForceFrom': validFrom,
        },
    };
    return (0, xmlBuilder_1.buildSlovenskoSkXml)(metaData, { headless: false, pretty: true });
};
exports.getMetaXml = getMetaXml;
