"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWebhookFormDefinition = exports.isEmailFormDefinition = exports.isSlovenskoSkFormDefinition = exports.isSlovenskoSkTaxFormDefinition = exports.isSlovenskoSkGenericFormDefinition = exports.FormDefinitionType = void 0;
var FormDefinitionType;
(function (FormDefinitionType) {
    FormDefinitionType["SlovenskoSkGeneric"] = "SlovenskoSkGeneric";
    FormDefinitionType["SlovenskoSkTax"] = "SlovenskoSkTax";
    FormDefinitionType["Email"] = "Email";
    FormDefinitionType["Webhook"] = "Webhook";
})(FormDefinitionType || (exports.FormDefinitionType = FormDefinitionType = {}));
const isSlovenskoSkGenericFormDefinition = (formDefinition) => formDefinition.type === FormDefinitionType.SlovenskoSkGeneric;
exports.isSlovenskoSkGenericFormDefinition = isSlovenskoSkGenericFormDefinition;
const isSlovenskoSkTaxFormDefinition = (formDefinition) => formDefinition.type === FormDefinitionType.SlovenskoSkTax;
exports.isSlovenskoSkTaxFormDefinition = isSlovenskoSkTaxFormDefinition;
const isSlovenskoSkFormDefinition = (formDefinition) => (0, exports.isSlovenskoSkGenericFormDefinition)(formDefinition) ||
    (0, exports.isSlovenskoSkTaxFormDefinition)(formDefinition);
exports.isSlovenskoSkFormDefinition = isSlovenskoSkFormDefinition;
const isEmailFormDefinition = (formDefinition) => formDefinition.type === FormDefinitionType.Email;
exports.isEmailFormDefinition = isEmailFormDefinition;
const isWebhookFormDefinition = (formDefinition) => formDefinition.type === FormDefinitionType.Webhook;
exports.isWebhookFormDefinition = isWebhookFormDefinition;
