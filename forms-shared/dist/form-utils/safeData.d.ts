export declare function safeArray<T>(array: T[] | undefined): T[];
export declare function safeArray(array: any): [];
export declare function safeString<T extends string>(string: T | undefined): T | undefined;
export declare function safeString(string: string | undefined): string | undefined;
export declare function safeNumber(number: number | any): number | undefined;
export declare function safeBoolean(boolean: boolean | any, undefinedFalse?: boolean): boolean | undefined;
