import { StepEnum } from './stepEnum';
export declare const stavbyBase: (step: StepEnum) => (import("../../generator/functions").Field | (Omit<import("../../generator/functions").Field, "property"> & {
    property: string | null;
    fieldProperties: string[];
}) | {
    condition: import("@rjsf/utils").RJSFSchema;
    thenSchema: import("@rjsf/utils").RJSFSchema;
    elseSchema?: import("@rjsf/utils").RJSFSchema | undefined;
    uiSchema: import("@rjsf/utils").UiSchema;
    fieldProperties: string[];
})[];
