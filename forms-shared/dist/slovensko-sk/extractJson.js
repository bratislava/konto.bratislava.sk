"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractJsonFromSlovenskoSkXml = exports.ExtractJsonFromSlovenskoSkXmlErrorType = exports.ExtractJsonFromSlovenskoSkXmlError = void 0;
const xml2js_1 = require("xml2js");
const ajv_1 = __importDefault(require("ajv"));
const urls_1 = require("./urls");
const baseFormXmlSchema = {
    type: 'object',
    properties: {
        eform: {
            type: 'object',
            properties: {
                $: {
                    type: 'object',
                    properties: {
                        xmlns: {
                            type: 'string',
                        },
                    },
                    required: ['xmlns'],
                },
                JsonVersion: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    minItems: 1,
                    maxItems: 1,
                },
                Json: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    minItems: 1,
                    maxItems: 1,
                },
            },
            required: ['$', 'Json'],
        },
    },
    required: ['eform'],
};
const parser = new xml2js_1.Parser({ explicitArray: true });
const isBaseFormXml = (data) => {
    const ajv = new ajv_1.default();
    return ajv.validate(baseFormXmlSchema, data);
};
class ExtractJsonFromSlovenskoSkXmlError extends Error {
    type;
    constructor(type) {
        super(type);
        this.type = type;
        this.name = 'ExtractJsonFromSlovenskoSkXmlError';
    }
}
exports.ExtractJsonFromSlovenskoSkXmlError = ExtractJsonFromSlovenskoSkXmlError;
var ExtractJsonFromSlovenskoSkXmlErrorType;
(function (ExtractJsonFromSlovenskoSkXmlErrorType) {
    ExtractJsonFromSlovenskoSkXmlErrorType["InvalidXml"] = "InvalidXml";
    ExtractJsonFromSlovenskoSkXmlErrorType["XmlDoesntMatchSchema"] = "XmlDoesntMatchSchema";
    ExtractJsonFromSlovenskoSkXmlErrorType["WrongPospId"] = "WrongPospId";
    ExtractJsonFromSlovenskoSkXmlErrorType["InvalidJson"] = "InvalidJson";
})(ExtractJsonFromSlovenskoSkXmlErrorType || (exports.ExtractJsonFromSlovenskoSkXmlErrorType = ExtractJsonFromSlovenskoSkXmlErrorType = {}));
/**
 * Extracts JSON data from Slovensko.sk XML string
 */
async function extractJsonFromSlovenskoSkXml(formDefinition, xmlString) {
    let parsedXml;
    try {
        parsedXml = await parser.parseStringPromise(xmlString);
    }
    catch {
        throw new ExtractJsonFromSlovenskoSkXmlError(ExtractJsonFromSlovenskoSkXmlErrorType.InvalidXml);
    }
    if (!isBaseFormXml(parsedXml)) {
        throw new ExtractJsonFromSlovenskoSkXmlError(ExtractJsonFromSlovenskoSkXmlErrorType.XmlDoesntMatchSchema);
    }
    const parsedXmlnsString = (0, urls_1.parseSlovenskoSkXmlnsString)(parsedXml.eform.$.xmlns);
    if (!parsedXmlnsString) {
        throw new ExtractJsonFromSlovenskoSkXmlError(ExtractJsonFromSlovenskoSkXmlErrorType.XmlDoesntMatchSchema);
    }
    if (parsedXmlnsString.pospID !== formDefinition.pospID) {
        throw new ExtractJsonFromSlovenskoSkXmlError(ExtractJsonFromSlovenskoSkXmlErrorType.WrongPospId);
    }
    try {
        return JSON.parse(parsedXml.eform.Json[0]);
    }
    catch {
        throw new ExtractJsonFromSlovenskoSkXmlError(ExtractJsonFromSlovenskoSkXmlErrorType.InvalidJson);
    }
}
exports.extractJsonFromSlovenskoSkXml = extractJsonFromSlovenskoSkXml;
