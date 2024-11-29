import { conditionalFields } from '../../generator/functions';
type SecondArg<F> = F extends (arg1: any, arg2: infer A, ...rest: any[]) => any ? A : never;
export declare const vyplnitKrokRadio: ({ title, helptext, helptextMarkdown, fields, }: {
    title: string;
    helptext: string;
    helptextMarkdown: boolean;
    fields: SecondArg<typeof conditionalFields>;
}) => ((Omit<import("../../generator/functions").Field, "property"> & {
    property: string | null;
    fieldProperties: string[];
}) | {
    condition: import("@rjsf/utils").RJSFSchema;
    thenSchema: import("@rjsf/utils").RJSFSchema;
    elseSchema?: import("@rjsf/utils").RJSFSchema | undefined;
    uiSchema: import("@rjsf/utils").UiSchema;
    fieldProperties: string[];
})[];
export {};
