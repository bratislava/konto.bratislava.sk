/// <reference types="node" />
import type { Browser } from 'playwright';
import { GenericObjectType } from '@rjsf/utils';
import { FormsBackendFile } from '../form-files/serverFilesTypes';
import { ClientFileInfo } from '../form-files/fileStatus';
import { FormDefinition } from '../definitions/formDefinitionTypes';
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry';
export type RenderSummaryPdfPayload = {
    formDefinition: FormDefinition;
    formData: GenericObjectType;
    /**
     * Playwright must be installed and managed by the consumer of this function (e.g. in Docker) to run correctly, and is
     * only a peer dependency of this package.
     */
    launchBrowser: () => Promise<Browser>;
    validatorRegistry: BaRjsfValidatorRegistry;
    serverFiles?: FormsBackendFile[];
    clientFiles?: ClientFileInfo[];
};
/**
 * Renders a summary PDF from the given JSON schema, UI schema and data.
 */
export declare const renderSummaryPdf: ({ formDefinition, formData, launchBrowser, validatorRegistry, clientFiles, serverFiles, }: RenderSummaryPdfPayload) => Promise<Buffer>;
