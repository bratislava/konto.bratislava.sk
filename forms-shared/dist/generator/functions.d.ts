/// <reference types="react" />
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { ArrayFieldUiOptions, CheckboxGroupUiOptions, CheckboxUiOptions, CustomComponentFieldUiOptions, CustomComponentType, DatePickerUiOptions, FileUploadUiOptions, InputUiOptions, NumberUiOptions, ObjectFieldUiOptions, RadioGroupUiOptions, SchemaUiOptions, SelectUiOptions, TextAreaUiOptions, TimePickerUiOptions } from './uiOptionsTypes';
import { BaAjvInputFormat } from '../form-utils/ajvFormats';
import { OptionItem } from './optionItems';
export type Schemas = {
    schema: RJSFSchema;
    uiSchema: UiSchema;
};
export type Field = {
    property: string;
    schema: RJSFSchema;
    uiSchema: UiSchema;
    required: boolean;
    skipUiSchema?: boolean;
    skipSchema?: boolean;
};
type ObjectField = Omit<Field, 'property'> & {
    property: string | null;
    fieldProperties: string[];
};
type ConditionalFields = {
    condition: RJSFSchema;
    thenSchema: RJSFSchema;
    elseSchema?: RJSFSchema;
    uiSchema: UiSchema;
    fieldProperties: string[];
};
export type FieldType = Field | ConditionalFields | ObjectField;
type BaseOptions = {
    title: string;
    required?: boolean;
};
export declare const select: (property: string, options: BaseOptions & {
    items: OptionItem<string>[];
}, uiOptions: Omit<SelectUiOptions, 'enumMetadata'>) => Field;
export declare const selectMultiple: (property: string, options: BaseOptions & {
    minItems?: number;
    maxItems?: number;
    items: OptionItem<string>[];
}, uiOptions: Omit<SelectUiOptions, 'enumMetadata'>) => Field;
export declare const input: (property: string, options: BaseOptions & {
    type: 'text' | 'password' | 'email' | BaAjvInputFormat;
    default?: string;
}, uiOptions: Omit<InputUiOptions, 'inputType'>) => Field;
export declare const number: (property: string, options: BaseOptions & {
    type?: 'number' | 'integer';
    default?: number;
    minimum?: number;
    exclusiveMinimum?: number;
    maximum?: number;
    exclusiveMaximum?: number;
}, uiOptions: NumberUiOptions) => Field;
type StringToType<T> = T extends 'string' ? string : T extends 'boolean' ? boolean : never;
export declare const radioGroup: <ValueType extends "string" | "boolean">(property: string, options: BaseOptions & {
    type: ValueType;
    items: OptionItem<StringToType<ValueType>>[];
}, uiOptions: Omit<RadioGroupUiOptions, 'enumMetadata'>) => Field;
export declare const textArea: (property: string, options: BaseOptions, uiOptions: TextAreaUiOptions) => Field;
export declare const checkbox: (property: string, options: BaseOptions & {
    default?: boolean;
    constValue?: boolean;
}, uiOptions: CheckboxUiOptions) => Field;
export declare const checkboxGroup: (property: string, options: BaseOptions & {
    minItems?: number;
    maxItems?: number;
    items: OptionItem<string>[];
}, uiOptions: Omit<CheckboxGroupUiOptions, 'enumMetadata'>) => Field;
export declare const fileUpload: (property: string, options: BaseOptions & {
    multiple?: boolean;
}, uiOptions: FileUploadUiOptions) => Field;
export declare const datePicker: (property: string, options: BaseOptions & {
    default?: string;
}, uiOptions: DatePickerUiOptions) => Field;
export declare const timePicker: (property: string, options: BaseOptions & {
    default?: string;
}, uiOptions: TimePickerUiOptions) => Field;
/**
 * This is a special field that represents no data in the schema. It is a "hacky way", but the easiest how to display
 * custom components in the UI anywhere we need.
 */
export declare const customComponentsField: (property: string, customComponents: CustomComponentType | CustomComponentType[], uiOptions: Omit<CustomComponentFieldUiOptions, 'customComponents'>) => Field;
/**
 * Object is the most complex field type to handle. For example, step is an instance of object. In JSONSchema, ordinary
 * fields are located in the `properties` key, while conditional fields are located in the `allOf` key. However, to
 * simplify the usage of the generator we provide a single interface for both ordinary and conditional fields. This
 * function splits them to their respective locations.
 */
export declare const object: (property: string | null, options: {
    required?: boolean;
}, uiOptions: ObjectFieldUiOptions, fields: (FieldType | null)[]) => ObjectField;
export declare const arrayField: (property: string, options: BaseOptions & {
    minItems?: number;
    maxItems?: number;
}, uiOptions: ArrayFieldUiOptions, fields: (FieldType | null)[]) => Field;
export declare const step: (property: string, options: {
    title: string;
    description?: string;
    stepperTitle?: string;
    customHash?: string;
}, fields: (FieldType | null)[]) => {
    property: string;
    schema: {
        type: string;
        properties: {
            [x: string]: {
                $id?: string | undefined;
                $ref?: string | undefined;
                $schema?: string | undefined;
                $comment?: string | undefined;
                $defs?: {
                    [key: string]: import("json-schema").JSONSchema7Definition;
                } | undefined;
                type?: import("json-schema").JSONSchema7TypeName | import("json-schema").JSONSchema7TypeName[] | undefined;
                enum?: import("json-schema").JSONSchema7Type[] | undefined;
                const?: import("json-schema").JSONSchema7Type | undefined;
                multipleOf?: number | undefined;
                maximum?: number | undefined;
                exclusiveMaximum?: number | undefined;
                minimum?: number | undefined;
                exclusiveMinimum?: number | undefined;
                maxLength?: number | undefined;
                minLength?: number | undefined;
                pattern?: string | undefined;
                items?: import("json-schema").JSONSchema7Definition | import("json-schema").JSONSchema7Definition[] | undefined;
                additionalItems?: import("json-schema").JSONSchema7Definition | undefined;
                maxItems?: number | undefined;
                minItems?: number | undefined;
                uniqueItems?: boolean | undefined;
                contains?: import("json-schema").JSONSchema7Definition | undefined;
                maxProperties?: number | undefined;
                minProperties?: number | undefined;
                required?: string[] | undefined;
                properties?: {
                    [key: string]: import("json-schema").JSONSchema7Definition;
                } | undefined;
                patternProperties?: {
                    [key: string]: import("json-schema").JSONSchema7Definition;
                } | undefined;
                additionalProperties?: import("json-schema").JSONSchema7Definition | undefined;
                dependencies?: {
                    [key: string]: string[] | import("json-schema").JSONSchema7Definition;
                } | undefined;
                propertyNames?: import("json-schema").JSONSchema7Definition | undefined;
                if?: import("json-schema").JSONSchema7Definition | undefined;
                then?: import("json-schema").JSONSchema7Definition | undefined;
                else?: import("json-schema").JSONSchema7Definition | undefined;
                allOf?: import("json-schema").JSONSchema7Definition[] | undefined;
                anyOf?: import("json-schema").JSONSchema7Definition[] | undefined;
                oneOf?: import("json-schema").JSONSchema7Definition[] | undefined;
                not?: import("json-schema").JSONSchema7Definition | undefined;
                format?: string | undefined;
                contentMediaType?: string | undefined;
                contentEncoding?: string | undefined;
                definitions?: {
                    [key: string]: import("json-schema").JSONSchema7Definition;
                } | undefined;
                title: string;
                description: string | undefined;
                default?: import("json-schema").JSONSchema7Type | undefined;
                readOnly?: boolean | undefined;
                writeOnly?: boolean | undefined;
                examples?: import("json-schema").JSONSchema7Type | undefined;
                file?: boolean | undefined;
            };
        };
        required: string[];
    };
    uiSchema: {
        'ui:options': {
            stepperTitle: string | undefined;
            stepQueryParam: string;
            ArrayFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateProps<any, RJSFSchema, any>> | undefined;
            ArrayFieldDescriptionTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldDescriptionProps<any, RJSFSchema, any>> | undefined;
            ArrayFieldItemTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateItemType<any, RJSFSchema, any>> | undefined;
            ArrayFieldTitleTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTitleProps<any, RJSFSchema, any>> | undefined;
            BaseInputTemplate?: import("react").ComponentType<import("@rjsf/utils").BaseInputTemplateProps<any, RJSFSchema, any>> | undefined;
            DescriptionFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").DescriptionFieldProps<any, RJSFSchema, any>> | undefined;
            ErrorListTemplate?: import("react").ComponentType<import("@rjsf/utils").ErrorListProps<any, RJSFSchema, any>> | undefined;
            FieldErrorTemplate?: import("react").ComponentType<import("@rjsf/utils").FieldErrorProps<any, RJSFSchema, any>> | undefined;
            FieldHelpTemplate?: import("react").ComponentType<import("@rjsf/utils").FieldHelpProps<any, RJSFSchema, any>> | undefined;
            FieldTemplate?: import("react").ComponentType<import("@rjsf/utils").FieldTemplateProps<any, RJSFSchema, any>> | undefined;
            ObjectFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").ObjectFieldTemplateProps<any, RJSFSchema, any>> | undefined;
            TitleFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").TitleFieldProps<any, RJSFSchema, any>> | undefined;
            UnsupportedFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").UnsupportedFieldProps<any, RJSFSchema, any>> | undefined;
            WrapIfAdditionalTemplate?: import("react").ComponentType<import("@rjsf/utils").WrapIfAdditionalTemplateProps<any, RJSFSchema, any>> | undefined;
            addable?: boolean | undefined;
            copyable?: boolean | undefined;
            orderable?: boolean | undefined;
            removable?: boolean | undefined;
            label?: boolean | undefined;
            duplicateKeySuffixSeparator?: string | undefined;
            classNames?: string | undefined;
            style?: import("react").StyleHTMLAttributes<any> | undefined;
            title?: string | undefined;
            description?: string | undefined;
            placeholder?: string | undefined;
            help?: string | undefined;
            autofocus?: boolean | undefined;
            autocomplete?: AutoFill | undefined;
            disabled?: boolean | undefined;
            emptyValue?: any;
            enumDisabled?: (string | number | boolean)[] | undefined;
            hideError?: boolean | undefined;
            readonly?: boolean | undefined;
            order?: string[] | undefined;
            filePreview?: boolean | undefined;
            inline?: boolean | undefined;
            inputType?: string | undefined;
            rows?: number | undefined;
            submitButtonOptions?: import("@rjsf/utils").UISchemaSubmitButtonOptions | undefined;
            widget?: string | import("@rjsf/utils").Widget<any, RJSFSchema, any> | undefined;
            enumNames?: string[] | undefined;
        };
        "ui:ArrayFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateProps<any, RJSFSchema, any>> | undefined;
        "ui:ArrayFieldDescriptionTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldDescriptionProps<any, RJSFSchema, any>> | undefined;
        "ui:ArrayFieldItemTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateItemType<any, RJSFSchema, any>> | undefined;
        "ui:ArrayFieldTitleTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTitleProps<any, RJSFSchema, any>> | undefined;
        "ui:BaseInputTemplate"?: import("react").ComponentType<import("@rjsf/utils").BaseInputTemplateProps<any, RJSFSchema, any>> | undefined;
        "ui:DescriptionFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").DescriptionFieldProps<any, RJSFSchema, any>> | undefined;
        "ui:ErrorListTemplate"?: import("react").ComponentType<import("@rjsf/utils").ErrorListProps<any, RJSFSchema, any>> | undefined;
        "ui:FieldErrorTemplate"?: import("react").ComponentType<import("@rjsf/utils").FieldErrorProps<any, RJSFSchema, any>> | undefined;
        "ui:FieldHelpTemplate"?: import("react").ComponentType<import("@rjsf/utils").FieldHelpProps<any, RJSFSchema, any>> | undefined;
        "ui:FieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").FieldTemplateProps<any, RJSFSchema, any>> | undefined;
        "ui:ObjectFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").ObjectFieldTemplateProps<any, RJSFSchema, any>> | undefined;
        "ui:TitleFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").TitleFieldProps<any, RJSFSchema, any>> | undefined;
        "ui:UnsupportedFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").UnsupportedFieldProps<any, RJSFSchema, any>> | undefined;
        "ui:WrapIfAdditionalTemplate"?: import("react").ComponentType<import("@rjsf/utils").WrapIfAdditionalTemplateProps<any, RJSFSchema, any>> | undefined;
        "ui:addable"?: boolean | undefined;
        "ui:copyable"?: boolean | undefined;
        "ui:orderable"?: boolean | undefined;
        "ui:removable"?: boolean | undefined;
        "ui:label"?: boolean | undefined;
        "ui:duplicateKeySuffixSeparator"?: string | undefined;
        "ui:classNames"?: string | undefined;
        "ui:style"?: import("react").StyleHTMLAttributes<any> | undefined;
        "ui:title"?: string | undefined;
        "ui:description"?: string | undefined;
        "ui:placeholder"?: string | undefined;
        "ui:help"?: string | undefined;
        "ui:autofocus"?: boolean | undefined;
        "ui:autocomplete"?: AutoFill | undefined;
        "ui:disabled"?: boolean | undefined;
        "ui:emptyValue"?: any;
        "ui:enumDisabled"?: (string | number | boolean)[] | undefined;
        "ui:hideError"?: boolean | undefined;
        "ui:readonly"?: boolean | undefined;
        "ui:order"?: string[] | undefined;
        "ui:filePreview"?: boolean | undefined;
        "ui:inline"?: boolean | undefined;
        "ui:inputType"?: string | undefined;
        "ui:rows"?: number | undefined;
        "ui:submitButtonOptions"?: import("@rjsf/utils").UISchemaSubmitButtonOptions | undefined;
        "ui:widget"?: string | import("@rjsf/utils").Widget<any, RJSFSchema, any> | undefined;
        "ui:enumNames"?: string[] | undefined;
        'ui:globalOptions'?: import("@rjsf/utils").GlobalUISchemaOptions | undefined;
        'ui:rootFieldId'?: string | undefined;
        'ui:field'?: string | import("@rjsf/utils").Field<any, RJSFSchema, any> | undefined;
        'ui:fieldReplacesAnyOrOneOf'?: boolean | undefined;
    };
};
export declare const conditionalStep: (property: string, condition: RJSFSchema, options: {
    title: string;
    customHash?: string;
}, fields: (FieldType | null)[]) => {
    property: string;
    schema: {
        if: RJSFSchema;
        then: {
            type: string;
            properties: {
                [x: string]: {
                    $id?: string | undefined;
                    $ref?: string | undefined;
                    $schema?: string | undefined;
                    $comment?: string | undefined;
                    $defs?: {
                        [key: string]: import("json-schema").JSONSchema7Definition;
                    } | undefined;
                    type?: import("json-schema").JSONSchema7TypeName | import("json-schema").JSONSchema7TypeName[] | undefined;
                    enum?: import("json-schema").JSONSchema7Type[] | undefined;
                    const?: import("json-schema").JSONSchema7Type | undefined;
                    multipleOf?: number | undefined;
                    maximum?: number | undefined;
                    exclusiveMaximum?: number | undefined;
                    minimum?: number | undefined;
                    exclusiveMinimum?: number | undefined;
                    maxLength?: number | undefined;
                    minLength?: number | undefined;
                    pattern?: string | undefined;
                    items?: import("json-schema").JSONSchema7Definition | import("json-schema").JSONSchema7Definition[] | undefined;
                    additionalItems?: import("json-schema").JSONSchema7Definition | undefined;
                    maxItems?: number | undefined;
                    minItems?: number | undefined;
                    uniqueItems?: boolean | undefined;
                    contains?: import("json-schema").JSONSchema7Definition | undefined;
                    maxProperties?: number | undefined;
                    minProperties?: number | undefined;
                    required?: string[] | undefined;
                    properties?: {
                        [key: string]: import("json-schema").JSONSchema7Definition;
                    } | undefined;
                    patternProperties?: {
                        [key: string]: import("json-schema").JSONSchema7Definition;
                    } | undefined;
                    additionalProperties?: import("json-schema").JSONSchema7Definition | undefined;
                    dependencies?: {
                        [key: string]: string[] | import("json-schema").JSONSchema7Definition;
                    } | undefined;
                    propertyNames?: import("json-schema").JSONSchema7Definition | undefined;
                    if?: import("json-schema").JSONSchema7Definition | undefined;
                    then?: import("json-schema").JSONSchema7Definition | undefined;
                    else?: import("json-schema").JSONSchema7Definition | undefined;
                    allOf?: import("json-schema").JSONSchema7Definition[] | undefined;
                    anyOf?: import("json-schema").JSONSchema7Definition[] | undefined;
                    oneOf?: import("json-schema").JSONSchema7Definition[] | undefined;
                    not?: import("json-schema").JSONSchema7Definition | undefined;
                    format?: string | undefined;
                    contentMediaType?: string | undefined;
                    contentEncoding?: string | undefined;
                    definitions?: {
                        [key: string]: import("json-schema").JSONSchema7Definition;
                    } | undefined;
                    title: string;
                    description: string | undefined;
                    default?: import("json-schema").JSONSchema7Type | undefined;
                    readOnly?: boolean | undefined;
                    writeOnly?: boolean | undefined;
                    examples?: import("json-schema").JSONSchema7Type | undefined;
                    file?: boolean | undefined;
                };
            };
            required: string[];
        };
    };
    uiSchema: {
        'ui:options': {
            stepperTitle: string | undefined;
            stepQueryParam: string;
            ArrayFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateProps<any, RJSFSchema, any>> | undefined;
            ArrayFieldDescriptionTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldDescriptionProps<any, RJSFSchema, any>> | undefined;
            ArrayFieldItemTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateItemType<any, RJSFSchema, any>> | undefined;
            ArrayFieldTitleTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTitleProps<any, RJSFSchema, any>> | undefined;
            BaseInputTemplate?: import("react").ComponentType<import("@rjsf/utils").BaseInputTemplateProps<any, RJSFSchema, any>> | undefined;
            DescriptionFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").DescriptionFieldProps<any, RJSFSchema, any>> | undefined;
            ErrorListTemplate?: import("react").ComponentType<import("@rjsf/utils").ErrorListProps<any, RJSFSchema, any>> | undefined;
            FieldErrorTemplate?: import("react").ComponentType<import("@rjsf/utils").FieldErrorProps<any, RJSFSchema, any>> | undefined;
            FieldHelpTemplate?: import("react").ComponentType<import("@rjsf/utils").FieldHelpProps<any, RJSFSchema, any>> | undefined;
            FieldTemplate?: import("react").ComponentType<import("@rjsf/utils").FieldTemplateProps<any, RJSFSchema, any>> | undefined;
            ObjectFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").ObjectFieldTemplateProps<any, RJSFSchema, any>> | undefined;
            TitleFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").TitleFieldProps<any, RJSFSchema, any>> | undefined;
            UnsupportedFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").UnsupportedFieldProps<any, RJSFSchema, any>> | undefined;
            WrapIfAdditionalTemplate?: import("react").ComponentType<import("@rjsf/utils").WrapIfAdditionalTemplateProps<any, RJSFSchema, any>> | undefined;
            addable?: boolean | undefined;
            copyable?: boolean | undefined;
            orderable?: boolean | undefined;
            removable?: boolean | undefined;
            label?: boolean | undefined;
            duplicateKeySuffixSeparator?: string | undefined;
            classNames?: string | undefined;
            style?: import("react").StyleHTMLAttributes<any> | undefined;
            title?: string | undefined;
            description?: string | undefined;
            placeholder?: string | undefined;
            help?: string | undefined;
            autofocus?: boolean | undefined;
            autocomplete?: AutoFill | undefined;
            disabled?: boolean | undefined;
            emptyValue?: any;
            enumDisabled?: (string | number | boolean)[] | undefined;
            hideError?: boolean | undefined;
            readonly?: boolean | undefined;
            order?: string[] | undefined;
            filePreview?: boolean | undefined;
            inline?: boolean | undefined;
            inputType?: string | undefined;
            rows?: number | undefined;
            submitButtonOptions?: import("@rjsf/utils").UISchemaSubmitButtonOptions | undefined;
            widget?: string | import("@rjsf/utils").Widget<any, RJSFSchema, any> | undefined;
            enumNames?: string[] | undefined;
        };
        "ui:ArrayFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateProps<any, RJSFSchema, any>> | undefined;
        "ui:ArrayFieldDescriptionTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldDescriptionProps<any, RJSFSchema, any>> | undefined;
        "ui:ArrayFieldItemTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateItemType<any, RJSFSchema, any>> | undefined;
        "ui:ArrayFieldTitleTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTitleProps<any, RJSFSchema, any>> | undefined;
        "ui:BaseInputTemplate"?: import("react").ComponentType<import("@rjsf/utils").BaseInputTemplateProps<any, RJSFSchema, any>> | undefined;
        "ui:DescriptionFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").DescriptionFieldProps<any, RJSFSchema, any>> | undefined;
        "ui:ErrorListTemplate"?: import("react").ComponentType<import("@rjsf/utils").ErrorListProps<any, RJSFSchema, any>> | undefined;
        "ui:FieldErrorTemplate"?: import("react").ComponentType<import("@rjsf/utils").FieldErrorProps<any, RJSFSchema, any>> | undefined;
        "ui:FieldHelpTemplate"?: import("react").ComponentType<import("@rjsf/utils").FieldHelpProps<any, RJSFSchema, any>> | undefined;
        "ui:FieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").FieldTemplateProps<any, RJSFSchema, any>> | undefined;
        "ui:ObjectFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").ObjectFieldTemplateProps<any, RJSFSchema, any>> | undefined;
        "ui:TitleFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").TitleFieldProps<any, RJSFSchema, any>> | undefined;
        "ui:UnsupportedFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").UnsupportedFieldProps<any, RJSFSchema, any>> | undefined;
        "ui:WrapIfAdditionalTemplate"?: import("react").ComponentType<import("@rjsf/utils").WrapIfAdditionalTemplateProps<any, RJSFSchema, any>> | undefined;
        "ui:addable"?: boolean | undefined;
        "ui:copyable"?: boolean | undefined;
        "ui:orderable"?: boolean | undefined;
        "ui:removable"?: boolean | undefined;
        "ui:label"?: boolean | undefined;
        "ui:duplicateKeySuffixSeparator"?: string | undefined;
        "ui:classNames"?: string | undefined;
        "ui:style"?: import("react").StyleHTMLAttributes<any> | undefined;
        "ui:title"?: string | undefined;
        "ui:description"?: string | undefined;
        "ui:placeholder"?: string | undefined;
        "ui:help"?: string | undefined;
        "ui:autofocus"?: boolean | undefined;
        "ui:autocomplete"?: AutoFill | undefined;
        "ui:disabled"?: boolean | undefined;
        "ui:emptyValue"?: any;
        "ui:enumDisabled"?: (string | number | boolean)[] | undefined;
        "ui:hideError"?: boolean | undefined;
        "ui:readonly"?: boolean | undefined;
        "ui:order"?: string[] | undefined;
        "ui:filePreview"?: boolean | undefined;
        "ui:inline"?: boolean | undefined;
        "ui:inputType"?: string | undefined;
        "ui:rows"?: number | undefined;
        "ui:submitButtonOptions"?: import("@rjsf/utils").UISchemaSubmitButtonOptions | undefined;
        "ui:widget"?: string | import("@rjsf/utils").Widget<any, RJSFSchema, any> | undefined;
        "ui:enumNames"?: string[] | undefined;
        'ui:globalOptions'?: import("@rjsf/utils").GlobalUISchemaOptions | undefined;
        'ui:rootFieldId'?: string | undefined;
        'ui:field'?: string | import("@rjsf/utils").Field<any, RJSFSchema, any> | undefined;
        'ui:fieldReplacesAnyOrOneOf'?: boolean | undefined;
    };
    required: boolean;
};
export declare const conditionalFields: (condition: RJSFSchema, thenFields: (FieldType | null)[], elseFields?: (FieldType | null)[]) => ConditionalFields;
export declare const schema: (options: {
    title: string;
    description?: string;
}, uiOptions: SchemaUiOptions, steps: (ReturnType<typeof step | typeof conditionalStep> | null)[]) => Schemas;
export declare const skipUiSchema: <F extends Field | ObjectField>(field: F) => F;
export declare const skipSchema: <F extends Field | ObjectField>(field: F) => F;
export {};
