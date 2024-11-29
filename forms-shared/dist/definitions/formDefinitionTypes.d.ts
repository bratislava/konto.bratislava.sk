import { Schemas } from '../generator/functions';
import { SharepointData } from './sharepointTypes';
import { GenericObjectType } from '@rjsf/utils';
export declare enum FormDefinitionType {
    SlovenskoSkGeneric = "SlovenskoSkGeneric",
    SlovenskoSkTax = "SlovenskoSkTax",
    Email = "Email",
    Webhook = "Webhook"
}
type FormDefinitionBase = {
    slug: string;
    title: string;
    schemas: Schemas;
    termsAndConditions: string;
    messageSubjectDefault: string;
    messageSubjectFormat?: string;
    additionalInfoTemplate?: string;
    embedded?: false | 'olo';
    allowSendingUnauthenticatedUsers?: boolean;
};
type FormDefinitionSlovenskoSkBase = FormDefinitionBase & {
    pospID: string;
    pospVersion: string;
    publisher: string;
    gestor: string;
    isSigned: boolean;
};
export type FormDefinitionSlovenskoSkGeneric = FormDefinitionSlovenskoSkBase & {
    type: FormDefinitionType.SlovenskoSkGeneric;
    ginisAssignment: {
        ginisOrganizationName: string;
        ginisPersonName?: string;
    };
    sharepointData?: SharepointData;
};
export type FormDefinitionSlovenskoSkTax = FormDefinitionSlovenskoSkBase & {
    type: FormDefinitionType.SlovenskoSkTax;
};
export type FormDefinitionWebhook = FormDefinitionBase & {
    type: FormDefinitionType.Webhook;
    webhookUrl: string;
};
export type FormDefinitionSlovenskoSk = FormDefinitionSlovenskoSkGeneric | FormDefinitionSlovenskoSkTax;
export type FormDefinitionEmail = FormDefinitionBase & {
    type: FormDefinitionType.Email;
    email: string;
    extractEmail: (formData: GenericObjectType) => string | undefined;
    extractName?: (formData: GenericObjectType) => string | undefined;
};
export type FormDefinition = FormDefinitionSlovenskoSkGeneric | FormDefinitionSlovenskoSkTax | FormDefinitionEmail | FormDefinitionWebhook;
export declare const isSlovenskoSkGenericFormDefinition: (formDefinition: FormDefinition) => formDefinition is FormDefinitionSlovenskoSkGeneric;
export declare const isSlovenskoSkTaxFormDefinition: (formDefinition: FormDefinition) => formDefinition is FormDefinitionSlovenskoSkTax;
export declare const isSlovenskoSkFormDefinition: (formDefinition: FormDefinition) => formDefinition is FormDefinitionSlovenskoSk;
export declare const isEmailFormDefinition: (formDefinition: FormDefinition) => formDefinition is FormDefinitionEmail;
export declare const isWebhookFormDefinition: (formDefinition: FormDefinition) => formDefinition is FormDefinitionWebhook;
export {};
