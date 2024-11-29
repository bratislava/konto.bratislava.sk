"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryJsonNode = void 0;
const jsdom_1 = __importDefault(require("jsdom"));
const getSummaryJson_1 = require("./getSummaryJson");
/**
 * Node.js implementation of `getSummaryJson`. Instead of `window.DOMParser` (which is not available
 * in Node), it uses compatible `jsdom` implementation. This will also work in browser, however
 * `jsdom` is huge - https://bundlephobia.com/package/jsdom, therefore it must never be included in
 * the client bundle.
 */
const getSummaryJsonNode = (jsonSchema, uiSchema, data, validatorRegistry) => {
    const jsDomInstance = new jsdom_1.default.JSDOM();
    const domParserInstance = new jsDomInstance.window.DOMParser();
    return (0, getSummaryJson_1.getSummaryJson)(jsonSchema, uiSchema, data, domParserInstance, validatorRegistry);
};
exports.getSummaryJsonNode = getSummaryJsonNode;
