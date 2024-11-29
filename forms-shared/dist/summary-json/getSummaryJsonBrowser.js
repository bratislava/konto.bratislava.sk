"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryJsonBrowser = void 0;
const getSummaryJson_1 = require("./getSummaryJson");
/**
 * Browser implementation of `getSummaryJson`. It cannot be used in Node.js environment, because
 * `window.DOMParser` is not available there.
 */
const getSummaryJsonBrowser = (jsonSchema, uiSchema, data, validatorRegistry) => {
    const domParserInstance = new window.DOMParser();
    return (0, getSummaryJson_1.getSummaryJson)(jsonSchema, uiSchema, data, domParserInstance, validatorRegistry);
};
exports.getSummaryJsonBrowser = getSummaryJsonBrowser;
