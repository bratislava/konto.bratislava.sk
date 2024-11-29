/// <reference types="react" />
import { GenericObjectType } from '@rjsf/utils';
export declare enum ZevoType {
    EnergetickeZhodnotenieOdpaduVZevo = 0,
    UzatvorenieZmluvyONakladaniSOdpadom = 1
}
export declare const getZevoSchema: (type: ZevoType) => ({
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
            ArrayFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            ArrayFieldDescriptionTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldDescriptionProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            ArrayFieldItemTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateItemType<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            ArrayFieldTitleTemplate?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTitleProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            BaseInputTemplate?: import("react").ComponentType<import("@rjsf/utils").BaseInputTemplateProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            DescriptionFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").DescriptionFieldProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            ErrorListTemplate?: import("react").ComponentType<import("@rjsf/utils").ErrorListProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            FieldErrorTemplate?: import("react").ComponentType<import("@rjsf/utils").FieldErrorProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            FieldHelpTemplate?: import("react").ComponentType<import("@rjsf/utils").FieldHelpProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            FieldTemplate?: import("react").ComponentType<import("@rjsf/utils").FieldTemplateProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            ObjectFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").ObjectFieldTemplateProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            TitleFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").TitleFieldProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            UnsupportedFieldTemplate?: import("react").ComponentType<import("@rjsf/utils").UnsupportedFieldProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
            WrapIfAdditionalTemplate?: import("react").ComponentType<import("@rjsf/utils").WrapIfAdditionalTemplateProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
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
            widget?: string | import("@rjsf/utils").Widget<any, import("@rjsf/utils").RJSFSchema, any> | undefined;
            enumNames?: string[] | undefined;
        };
        "ui:ArrayFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:ArrayFieldDescriptionTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldDescriptionProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:ArrayFieldItemTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTemplateItemType<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:ArrayFieldTitleTemplate"?: import("react").ComponentType<import("@rjsf/utils").ArrayFieldTitleProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:BaseInputTemplate"?: import("react").ComponentType<import("@rjsf/utils").BaseInputTemplateProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:DescriptionFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").DescriptionFieldProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:ErrorListTemplate"?: import("react").ComponentType<import("@rjsf/utils").ErrorListProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:FieldErrorTemplate"?: import("react").ComponentType<import("@rjsf/utils").FieldErrorProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:FieldHelpTemplate"?: import("react").ComponentType<import("@rjsf/utils").FieldHelpProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:FieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").FieldTemplateProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:ObjectFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").ObjectFieldTemplateProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:TitleFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").TitleFieldProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:UnsupportedFieldTemplate"?: import("react").ComponentType<import("@rjsf/utils").UnsupportedFieldProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
        "ui:WrapIfAdditionalTemplate"?: import("react").ComponentType<import("@rjsf/utils").WrapIfAdditionalTemplateProps<any, import("@rjsf/utils").RJSFSchema, any>> | undefined;
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
        "ui:widget"?: string | import("@rjsf/utils").Widget<any, import("@rjsf/utils").RJSFSchema, any> | undefined;
        "ui:enumNames"?: string[] | undefined;
        'ui:globalOptions'?: import("@rjsf/utils").GlobalUISchemaOptions | undefined;
        'ui:rootFieldId'?: string | undefined;
        'ui:field'?: string | import("@rjsf/utils").Field<any, import("@rjsf/utils").RJSFSchema, any> | undefined;
        'ui:fieldReplacesAnyOrOneOf'?: boolean | undefined;
    };
} | null)[];
export declare const zevoExtractEmail: (formData: GenericObjectType) => any;
export declare const zevoExtractName: (formData: GenericObjectType) => any;
