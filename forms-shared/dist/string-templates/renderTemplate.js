"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFormAdditionalInfo = exports.renderFormTemplate = void 0;
const safeData_1 = require("../form-utils/safeData");
const eta_1 = require("eta");
const eta = new eta_1.Eta();
const renderFormTemplate = (formData, templateString, logError = false) => {
    try {
        const renderedString = eta.renderString(templateString, {
            formData,
            helpers: {
                safeArray: safeData_1.safeArray,
                safeString: safeData_1.safeString,
                safeNumber: safeData_1.safeNumber,
                safeBoolean: safeData_1.safeBoolean,
            },
        });
        if (renderedString.trim() === '') {
            return null;
        }
        return renderedString;
    }
    catch (error) {
        if (logError) {
            console.error('Error rendering template', error);
        }
        return null;
    }
};
exports.renderFormTemplate = renderFormTemplate;
const renderFormAdditionalInfo = (formDefinition, formDataJson, logError = false) => {
    if (!formDefinition.additionalInfoTemplate) {
        return null;
    }
    return (0, exports.renderFormTemplate)(formDataJson, formDefinition.additionalInfoTemplate, logError);
};
exports.renderFormAdditionalInfo = renderFormAdditionalInfo;
