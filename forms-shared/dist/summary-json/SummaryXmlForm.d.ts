import { FormProps } from '@rjsf/core';
import React, { DetailedHTMLProps, HTMLAttributes } from 'react';
import { BaWidgetType } from '../generator/uiOptionsTypes';
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry';
export declare enum SummaryXmlFormTag {
    Form = "summary-form",
    Step = "step",
    Array = "array",
    ArrayItem = "array-item",
    Field = "field"
}
type SummaryXmlFormFormAttributes = {
    id: string;
    title: string;
};
type SummaryXmlFormStepAttributes = {
    id: string;
    name: string;
    title: string;
};
type SummaryXmlFormArrayAttributes = {
    id: string;
    length: number;
    title: string;
};
type SummaryXmlFormArrayItemAttributes = {
    id: string;
    title: string;
};
type SummaryXmlFormFieldAttributes = {
    id: string;
    type: BaWidgetType;
    label: string;
    value: string;
    'display-values': string;
};
type CustomElement<P = {}> = DetailedHTMLProps<HTMLAttributes<HTMLElement> & P, HTMLElement>;
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            [SummaryXmlFormTag.Form]: CustomElement<SummaryXmlFormFormAttributes>;
            [SummaryXmlFormTag.Step]: CustomElement<SummaryXmlFormStepAttributes>;
            [SummaryXmlFormTag.Array]: CustomElement<SummaryXmlFormArrayAttributes>;
            [SummaryXmlFormTag.ArrayItem]: CustomElement<SummaryXmlFormArrayItemAttributes>;
            [SummaryXmlFormTag.Field]: CustomElement<SummaryXmlFormFieldAttributes>;
        }
    }
}
type SummaryXmlFormProps = Pick<FormProps, 'schema' | 'uiSchema' | 'formData'> & {
    validatorRegistry: BaRjsfValidatorRegistry;
};
/**
 * Generates a summary XML form based on the provided schema, UI schema, and form data.
 *
 * Getting a summary for JSON Schema data is hard and is not supported by RJSF out of the box. This component leverages
 * that RJSF allows to customize the form rendering and generates a custom XML structure that represents the form data.
 * Unfortunately, it is not possible to generate a JSON summary directly, so the XML is later parsed into JSON.
 * The generated XML is tightly coupled with its parsing in `getSummaryJson` function, and it is not used anywhere else.
 */
export declare const SummaryXmlForm: ({ schema, uiSchema, formData, validatorRegistry, }: SummaryXmlFormProps) => React.JSX.Element;
export {};
