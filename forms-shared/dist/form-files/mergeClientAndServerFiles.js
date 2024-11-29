"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeClientAndServerFilesSummary = exports.mergeClientAndServerFiles = void 0;
const fileStatus_1 = require("./fileStatus");
const serverFilesTypes_1 = require("./serverFilesTypes");
const mapClientFile = (clientFileInfo) => ({
    [clientFileInfo.id]: {
        status: clientFileInfo.status,
        fileName: clientFileInfo.file.name,
        fileSize: clientFileInfo.file.size,
    },
});
const mapClientFileSummary = (clientFileInfo) => ({
    [clientFileInfo.id]: {
        id: clientFileInfo.id,
        statusType: clientFileInfo.status.type,
        fileName: clientFileInfo.file.name,
    },
});
const serverResponseToStatusMap = {
    [serverFilesTypes_1.FormsBackendFileStatusEnum.Uploaded]: fileStatus_1.FileStatusType.WaitingForScan,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.Accepted]: fileStatus_1.FileStatusType.WaitingForScan,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.Queued]: fileStatus_1.FileStatusType.WaitingForScan,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.Scanning]: fileStatus_1.FileStatusType.Scanning,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.Safe]: fileStatus_1.FileStatusType.ScanDone,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.Infected]: fileStatus_1.FileStatusType.ScanInfected,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.NotFound]: fileStatus_1.FileStatusType.ScanError,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.MoveErrorSafe]: fileStatus_1.FileStatusType.ScanError,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.MoveErrorInfected]: fileStatus_1.FileStatusType.ScanInfected,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.ScanError]: fileStatus_1.FileStatusType.ScanError,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.ScanTimeout]: fileStatus_1.FileStatusType.ScanError,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.ScanNotSuccessful]: fileStatus_1.FileStatusType.ScanError,
    [serverFilesTypes_1.FormsBackendFileStatusEnum.FormIdNotFound]: fileStatus_1.FileStatusType.UnknownFile,
};
const mapServerFile = (serverFileInfo) => ({
    [serverFileInfo.id]: {
        status: { type: serverResponseToStatusMap[serverFileInfo.status] },
        fileName: serverFileInfo.fileName,
        fileSize: serverFileInfo.fileSize,
    },
});
const mapServerFileSummary = (serverFileInfo) => ({
    [serverFileInfo.id]: {
        id: serverFileInfo.id,
        statusType: serverResponseToStatusMap[serverFileInfo.status],
        fileName: serverFileInfo.fileName,
    },
});
/**
 * Merges client and server files into a single object.
 *
 * The uploaded files are stored both in the `clientFiles` and `serverFiles`. However, the clientFiles don't hold the
 * necessary information so is overridden by the `serverFiles`.
 */
const mergeClientAndServerFiles = (clientFiles, serverFiles) => {
    const clientFilesMapped = clientFiles.map(mapClientFile);
    const serverFilesMapped = serverFiles.map(mapServerFile);
    // If there's a conflict, the server file takes precedence which is an expected behaviour.
    return [...clientFilesMapped, ...serverFilesMapped].reduce((acc, curr) => ({ ...acc, ...curr }), {});
};
exports.mergeClientAndServerFiles = mergeClientAndServerFiles;
const mergeClientAndServerFilesSummary = (clientFiles = [], serverFiles = []) => {
    const clientFilesMapped = clientFiles.map(mapClientFileSummary);
    const serverFilesMapped = serverFiles.map(mapServerFileSummary);
    // If there's a conflict, the server file takes precedence which is an expected behaviour.
    return [...clientFilesMapped, ...serverFilesMapped].reduce((acc, curr) => ({ ...acc, ...curr }), {});
};
exports.mergeClientAndServerFilesSummary = mergeClientAndServerFilesSummary;
