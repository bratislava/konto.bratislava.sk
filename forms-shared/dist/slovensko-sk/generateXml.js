"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlovenskoSkXmlObject = exports.getEmptySlovenskoSkXmlObject = void 0;
const renderXmlSummary_1 = require("./renderXmlSummary");
const remove_markdown_1 = __importDefault(require("remove-markdown"));
const urls_1 = require("./urls");
function getSlovenskoSkXmlObjectBase(formDefinition, body) {
    return {
        eform: {
            $: {
                xmlns: (0, urls_1.getSlovenskoSkXmlns)(formDefinition),
                'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            },
            ...body,
        },
    };
}
/**
 * Generates an empty Slovensko SK XML object that can be built with "xml2js" to create a valid XML.
 */
function getEmptySlovenskoSkXmlObject(formDefinition) {
    return getSlovenskoSkXmlObjectBase(formDefinition, {
        JsonVersion: '',
        Json: JSON.stringify({}),
        Summary: {
            Form: {
                $: {
                    title: formDefinition.title,
                },
            },
        },
        TermsAndConditions: '',
    });
}
exports.getEmptySlovenskoSkXmlObject = getEmptySlovenskoSkXmlObject;
/**
 * Generates a Slovensko SK XML object that can be built with "xml2js" to create a valid XML.
 */
async function generateSlovenskoSkXmlObject(formDefinition, formData, validatorRegistry, serverFiles) {
    return getSlovenskoSkXmlObjectBase(formDefinition, {
        // Before versioning for JSON is implemented, we will hardcode the version to 1.0 as we want to have the version
        // in Slovensko.sk XMLs beforehand to accommodate for future changes.
        JsonVersion: '1.0',
        Json: JSON.stringify(formData),
        Summary: await (0, renderXmlSummary_1.renderSlovenskoXmlSummary)(formDefinition, formData, validatorRegistry, serverFiles),
        TermsAndConditions: (0, remove_markdown_1.default)(formDefinition.termsAndConditions),
    });
}
exports.generateSlovenskoSkXmlObject = generateSlovenskoSkXmlObject;
