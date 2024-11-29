/**
 * Create phone number input field consitent with all forms.
 */
export declare const sharedPhoneNumberField: (property: string, required: boolean, helptext?: string) => import("../../generator/functions").Field;
/**
 * Create address input fields.
 */
export declare const sharedAddressField: (property: string, title: string, required: boolean) => Omit<import("../../generator/functions").Field, "property"> & {
    property: string | null;
    fieldProperties: string[];
};
