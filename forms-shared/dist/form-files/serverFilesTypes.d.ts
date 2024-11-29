export declare const FormsBackendFileStatusEnum: {
    readonly Uploaded: "UPLOADED";
    readonly Accepted: "ACCEPTED";
    readonly Queued: "QUEUED";
    readonly Scanning: "SCANNING";
    readonly Safe: "SAFE";
    readonly Infected: "INFECTED";
    readonly NotFound: "NOT_FOUND";
    readonly MoveErrorSafe: "MOVE_ERROR_SAFE";
    readonly MoveErrorInfected: "MOVE_ERROR_INFECTED";
    readonly ScanError: "SCAN_ERROR";
    readonly ScanTimeout: "SCAN_TIMEOUT";
    readonly ScanNotSuccessful: "SCAN_NOT_SUCCESSFUL";
    readonly FormIdNotFound: "FORM_ID_NOT_FOUND";
};
export type FormsBackendFileStatusEnum = (typeof FormsBackendFileStatusEnum)[keyof typeof FormsBackendFileStatusEnum];
export interface FormsBackendFile {
    id: string;
    fileName: string;
    fileSize: number;
    status: FormsBackendFileStatusEnum;
}
