"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryJson = void 0;
const react_1 = __importDefault(require("react"));
const server_1 = require("react-dom/server");
const summaryJsonTypes_1 = require("./summaryJsonTypes");
const SummaryXmlForm_1 = require("./SummaryXmlForm");
const allowedChildren = {
    [SummaryXmlForm_1.SummaryXmlFormTag.Form]: [SummaryXmlForm_1.SummaryXmlFormTag.Step],
    [SummaryXmlForm_1.SummaryXmlFormTag.Step]: [SummaryXmlForm_1.SummaryXmlFormTag.Field, SummaryXmlForm_1.SummaryXmlFormTag.Array],
    [SummaryXmlForm_1.SummaryXmlFormTag.Array]: [SummaryXmlForm_1.SummaryXmlFormTag.ArrayItem],
    [SummaryXmlForm_1.SummaryXmlFormTag.ArrayItem]: [SummaryXmlForm_1.SummaryXmlFormTag.Field, SummaryXmlForm_1.SummaryXmlFormTag.Array],
    [SummaryXmlForm_1.SummaryXmlFormTag.Field]: [],
};
function isAllowedTag(tag) {
    return Object.values(SummaryXmlForm_1.SummaryXmlFormTag).includes(tag);
}
/**
 * Asserts that the element is a valid XML element for the summary form and that it has only allowed children elements.
 *
 * As our code generates the XML, this might be considered redundant, but while rendering the XML there is no check
 * whether the XML elements have only the allowed children. Also, we rely on RJSF rendering, which could change in the
 * future (see issue with adding unnecessary `div` elements in RJSF as described in XML rendering).
 */
const assertElement = (element) => {
    const tagName = element.tagName.toLowerCase();
    if (!isAllowedTag(tagName)) {
        throw new Error(`Invalid tag ${tagName}`);
    }
    Array.from(element.children).forEach((child) => {
        const childTagName = child.tagName.toLowerCase();
        if (!isAllowedTag(childTagName)) {
            throw new Error(`Invalid child tag ${childTagName}`);
        }
        if (!allowedChildren[tagName].includes(childTagName)) {
            throw new Error(`Invalid child tag ${childTagName} for ${tagName}`);
        }
    });
};
/**
 * Parses a JSON from an XML attribute value.
 *
 * If the attribute value is `null` (which is different from stringified `"null"`!), the value is not defined, and it
 * spreads an empty object.
 */
const getJsonParsedObject = (key, attributeValue) => {
    if (attributeValue === null) {
        return null;
    }
    return {
        [key]: JSON.parse(attributeValue),
    };
};
/**
 * Parses the summary XML string into a JSON object.
 */
function parseXml(domParserInstance, xmlString) {
    const doc = domParserInstance.parseFromString(xmlString, 'text/html');
    const root = doc.documentElement.querySelector(SummaryXmlForm_1.SummaryXmlFormTag.Form);
    if (root == null) {
        throw new Error('No root element found.');
    }
    function elementToJson(element) {
        assertElement(element);
        const tagName = element.tagName.toLowerCase();
        const getChildren = () => Array.from(element.children).map((child) => elementToJson(child));
        switch (tagName) {
            case SummaryXmlForm_1.SummaryXmlFormTag.Form:
                return {
                    type: summaryJsonTypes_1.SummaryJsonType.Form,
                    id: element.getAttribute('id'),
                    title: element.getAttribute('title'),
                    steps: getChildren(),
                };
            case SummaryXmlForm_1.SummaryXmlFormTag.Step:
                return {
                    type: summaryJsonTypes_1.SummaryJsonType.Step,
                    id: element.getAttribute('id'),
                    title: element.getAttribute('title'),
                    children: getChildren(),
                };
            case SummaryXmlForm_1.SummaryXmlFormTag.Field:
                const valueRaw = element.getAttribute('value');
                const displayValuesRaw = element.getAttribute('display-values');
                return {
                    type: summaryJsonTypes_1.SummaryJsonType.Field,
                    id: element.getAttribute('id'),
                    label: element.getAttribute('label'),
                    ...getJsonParsedObject('value', valueRaw),
                    ...getJsonParsedObject('displayValues', displayValuesRaw),
                };
            case SummaryXmlForm_1.SummaryXmlFormTag.Array:
                return {
                    type: summaryJsonTypes_1.SummaryJsonType.Array,
                    id: element.getAttribute('id'),
                    title: element.getAttribute('title'),
                    items: getChildren(),
                };
            case SummaryXmlForm_1.SummaryXmlFormTag.ArrayItem:
                return {
                    type: summaryJsonTypes_1.SummaryJsonType.ArrayItem,
                    id: element.getAttribute('id'),
                    title: element.getAttribute('title'),
                    children: getChildren(),
                };
            default:
                throw new Error(`Invalid tag ${tagName}`);
        }
    }
    return elementToJson(root);
}
/**
 * Renders the summary form and parses the XML into a JSON object.
 */
const getSummaryJson = (jsonSchema, uiSchema, data, domParserInstance, validatorRegistry) => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const renderedString = (0, server_1.renderToString)(react_1.default.createElement(SummaryXmlForm_1.SummaryXmlForm, { schema: jsonSchema, uiSchema: uiSchema, formData: data, validatorRegistry: validatorRegistry }));
    return parseXml(domParserInstance, renderedString);
};
exports.getSummaryJson = getSummaryJson;
