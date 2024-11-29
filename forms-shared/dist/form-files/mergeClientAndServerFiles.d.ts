import { ClientFileInfo, FileInfo, FileInfoSummary } from './fileStatus';
import { FormsBackendFile } from './serverFilesTypes';
/**
 * Merges client and server files into a single object.
 *
 * The uploaded files are stored both in the `clientFiles` and `serverFiles`. However, the clientFiles don't hold the
 * necessary information so is overridden by the `serverFiles`.
 */
export declare const mergeClientAndServerFiles: (clientFiles: ClientFileInfo[], serverFiles: FormsBackendFile[]) => Record<string, FileInfo>;
export declare const mergeClientAndServerFilesSummary: (clientFiles?: ClientFileInfo[], serverFiles?: FormsBackendFile[]) => Record<string, FileInfoSummary>;
