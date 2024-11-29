import 'json-schema';
import { JSONSchema7 } from 'json-schema';
declare module 'json-schema' {
    interface JSONSchema7 {
        file?: boolean;
    }
}
export type BAJSONSchema7 = JSONSchema7;
export declare const baAjvKeywords: {
    keyword: string;
}[];
