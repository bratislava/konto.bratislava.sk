import { StepEnum } from './stepEnum';
export declare const pravnyVztahSpoluvlastnictvo: (step?: StepEnum) => (import("../../generator/functions").Field | {
    condition: import("@rjsf/utils").RJSFSchema;
    thenSchema: import("@rjsf/utils").RJSFSchema;
    elseSchema?: import("@rjsf/utils").RJSFSchema | undefined;
    uiSchema: import("@rjsf/utils").UiSchema;
    fieldProperties: string[];
})[];
