import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
/**
 * Extracts used file UUIDs from form data.
 *
 * This is a naive implementation that extracts all the valid UUIDs, but is very performant compared
 * to the "normal" version.
 */
export declare const getFileUuidsNaive: (formData: GenericObjectType) => string[];
/**
 * Extracts used file UUIDs from form data.
 *
 * This uses (or abuses) a possibility to provide a custom validate function for AJV. This is only
 * one of few ways how to traverse the form data for specific values. In this case, we extract the
 * file ids from the form data.
 */
export declare const getFileUuids: (schema: RJSFSchema, formData: GenericObjectType) => string[];
