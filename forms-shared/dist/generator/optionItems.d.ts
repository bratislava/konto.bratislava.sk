import { EnumOptionsType } from '@rjsf/utils';
type ValueTypeBase = string | boolean;
export type OptionItem<ValueType extends ValueTypeBase> = {
    value: ValueType;
    label: string;
    isDefault?: boolean;
    description?: string;
};
export declare const createEnumSchemaEnum: <ValueType extends ValueTypeBase>(list: OptionItem<ValueType>[]) => ValueType[];
export declare const createEnumSchemaDefault: <ValueType extends ValueTypeBase>(list: OptionItem<ValueType>[]) => ValueType | undefined;
export declare const createEnumSchemaDefaultMultiple: <ValueType extends ValueTypeBase>(list: OptionItem<ValueType>[]) => ValueType[];
export type EnumMetadata<ValueType extends ValueTypeBase> = {
    value: ValueType;
    label: string;
    description?: string;
};
export declare const createEnumMetadata: <ValueType extends ValueTypeBase>(list: OptionItem<ValueType>[]) => {
    value: ValueType;
    label: string;
    description: string | undefined;
}[];
export declare const mergeEnumOptionsMetadata: <ValueType extends ValueTypeBase>(enumOptions: EnumOptionsType[], enumMetadata: EnumMetadata<ValueType>[]) => EnumMetadata<ValueType>[];
export {};
