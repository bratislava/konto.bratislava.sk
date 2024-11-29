"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryRenderer = void 0;
const react_1 = __importStar(require("react"));
const summaryJsonTypes_1 = require("../summary-json/summaryJsonTypes");
const getSummaryDisplayValue_1 = require("../summary-json/getSummaryDisplayValue");
const DisplayValueRenderer = ({ validatedSummary, displayValue, renderStringValue, renderFileValue, renderNoneValue, renderInvalidValue, index, isFirst, isLast, }) => {
    const childPropsBase = {
        index,
        isFirst,
        isLast,
    };
    switch (displayValue.type) {
        case getSummaryDisplayValue_1.SummaryDisplayValueType.String:
            return react_1.default.createElement(react_1.default.Fragment, null, renderStringValue({ value: displayValue.value, ...childPropsBase }));
        case getSummaryDisplayValue_1.SummaryDisplayValueType.File:
            const fileInfo = validatedSummary?.getFileById(displayValue.id);
            if (!fileInfo) {
                return react_1.default.createElement(react_1.default.Fragment, null, renderInvalidValue(childPropsBase));
            }
            return react_1.default.createElement(react_1.default.Fragment, null, renderFileValue({ id: displayValue.id, fileInfo, ...childPropsBase }));
        case getSummaryDisplayValue_1.SummaryDisplayValueType.None:
            return react_1.default.createElement(react_1.default.Fragment, null, renderNoneValue(childPropsBase));
        case getSummaryDisplayValue_1.SummaryDisplayValueType.Invalid:
            return react_1.default.createElement(react_1.default.Fragment, null, renderInvalidValue(childPropsBase));
        default:
            return null;
    }
};
/**
 * Renders a summary JSON to a React component.
 *
 * This encapsulates the common logic of rendering the summary JSON into a React component. See usage for more details.
 */
const SummaryRenderer = ({ summaryJson, validatedSummary, renderForm, renderStep, renderField, renderArray, renderArrayItem, renderStringValue, renderFileValue, renderNoneValue, renderInvalidValue, }) => {
    const renderElement = (element, index, isLast) => {
        const renderChildren = (children) => children.map((child, childIndex) => {
            const isLastChild = childIndex === children.length - 1;
            return react_1.default.createElement(react_1.Fragment, { key: child.id }, renderElement(child, childIndex, isLastChild));
        });
        const base = {
            hasError: validatedSummary?.pathHasError(element.id) ?? false,
            index,
            isFirst: index === 0,
            isLast,
        };
        switch (element.type) {
            case summaryJsonTypes_1.SummaryJsonType.Form:
                return renderForm({
                    form: element,
                    children: renderChildren(element.steps),
                    ...base,
                });
            case summaryJsonTypes_1.SummaryJsonType.Step:
                return renderStep({
                    step: element,
                    children: renderChildren(element.children),
                    ...base,
                });
            case summaryJsonTypes_1.SummaryJsonType.Field:
                return renderField({
                    field: element,
                    children: element.displayValues.map((displayValue, index) => (react_1.default.createElement(DisplayValueRenderer, { key: index, validatedSummary: validatedSummary, displayValue: displayValue, renderStringValue: renderStringValue, renderFileValue: renderFileValue, renderNoneValue: renderNoneValue, renderInvalidValue: renderInvalidValue, index: index, isFirst: index === 0, isLast: index === element.displayValues.length - 1 }))),
                    ...base,
                });
            case summaryJsonTypes_1.SummaryJsonType.Array:
                return renderArray({
                    array: element,
                    children: renderChildren(element.items),
                    ...base,
                });
            case summaryJsonTypes_1.SummaryJsonType.ArrayItem:
                return renderArrayItem({
                    arrayItem: element,
                    children: renderChildren(element.children),
                    ...base,
                });
            default:
                throw new Error(`Invalid element type`);
        }
    };
    return renderElement(summaryJson, 0, true);
};
exports.SummaryRenderer = SummaryRenderer;
