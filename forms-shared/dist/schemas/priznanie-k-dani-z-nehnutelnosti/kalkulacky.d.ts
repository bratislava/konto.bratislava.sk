import { Field } from '../../generator/functions';
export declare const kalkulackaFields: ({ title, checkboxLabel, helptext, inner, }: {
    title: string;
    checkboxLabel: string;
    helptext: string;
    inner: (kalkulacka: boolean) => Field;
}) => ((Omit<Field, "property"> & {
    property: string | null;
    fieldProperties: string[];
}) | {
    condition: import("@rjsf/utils").RJSFSchema;
    thenSchema: import("@rjsf/utils").RJSFSchema;
    elseSchema?: import("@rjsf/utils").RJSFSchema | undefined;
    uiSchema: import("@rjsf/utils").UiSchema;
    fieldProperties: string[];
})[];
