"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devFormDefinitions = void 0;
const formDefinitionTypes_1 = require("./formDefinitionTypes");
const termsAndConditions_1 = require("./termsAndConditions");
const showcase_1 = __importDefault(require("../schemas/showcase"));
exports.devFormDefinitions = [
    {
        type: formDefinitionTypes_1.FormDefinitionType.SlovenskoSkGeneric,
        slug: 'showcase',
        title: 'Showcase',
        schemas: showcase_1.default,
        pospID: '',
        pospVersion: '',
        publisher: '',
        gestor: '',
        termsAndConditions: termsAndConditions_1.generalTermsAndConditions,
        messageSubjectDefault: 'Showcase',
        ginisAssignment: {
            ginisOrganizationName: '',
            ginisPersonName: '',
        },
        isSigned: false,
    },
];
