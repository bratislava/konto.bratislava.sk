declare module 'clamdjs' {
  import { Readable } from 'stream';

  /**
   * Get the ClamAV server version.
   * @param host ClamAV server's host.
   * @param port ClamAV server's port.
   * @param timeout Optional socket timeout (default: 5000 ms).
   * @returns A promise resolving to the version string.
   */
  export async function version(
    host: string,
    port: number,
    timeout?: number,
  ): Promise<string>;

  /**
   * Check if the ClamAV daemon is responsive.
   * @param host ClamAV server's host.
   * @param port ClamAV server's port.
   * @param timeout Optional socket timeout (default: 5000 ms).
   * @returns A promise resolving to a boolean indicating server responsiveness.
   */
  export async function ping(
    host: string,
    port: number,
    timeout?: number,
  ): Promise<boolean>;

  /**
   * Check if the scan result indicates a clean file.
   * @param reply Response from ClamAV scanner.
   * @returns A boolean indicating if the file is clean.
   */
  export function isCleanReply(reply: string): boolean;

  /**
   * Interface representing a ClamAV scanner.
   */
  export interface Scanner {
    /**
     * Scan a readable stream.
     * @param readStream The stream containing data to scan.
     * @param timeout Optional socket timeout (default: 5000 ms).
     * @returns A promise resolving to the scan result.
     */
    scanStream(readStream: Readable, timeout?: number): Promise<string>;

    /**
     * Scan a buffer.
     * @param buffer The buffer containing data to scan.
     * @param timeout Optional socket timeout (default: 5000 ms).
     * @param chunkSize Optional chunk size sent to the ClamAV server (default: 64 KB).
     * @returns A promise resolving to the scan result.
     */
    scanBuffer(
      buffer: Buffer,
      timeout?: number,
      chunkSize?: number,
    ): Promise<string>;

    /**
     * Scan a file.
     * @param filePath Path to the file to be scanned.
     * @param timeout Optional socket timeout (default: 5000 ms).
     * @param chunkSize Optional chunk size sent to the ClamAV server (default: 64 KB).
     * @returns A promise resolving to the scan result.
     */
    scanFile(
      filePath: string,
      timeout?: number,
      chunkSize?: number,
    ): Promise<string>;

    /**
     * Scan a directory.
     * @param rootPath Path to the directory to be scanned.
     * @param options Optional scanning options.
     * @returns A promise resolving to the scan results.
     */
    scanDirectory(
      rootPath: string,
      options?: ScanDirectoryOptions,
    ): Promise<ScanDirectoryResult>;
  }

  /**
   * Options for scanning a directory.
   */
  export interface ScanDirectoryOptions {
    timeout?: number;
    chunkSize?: number;
    scanningFile?: number;
    detail?: boolean;
    cont?: boolean;
  }

  /**
   * Result of a directory scan.
   */
  export interface ScanDirectoryResult {
    ScannedFiles: number;
    Infected: number;
    EncounterError: number;
    Result: {
      file: string;
      reply: string | null;
      errorMsg: string | null;
    }[];
  }

  /**
   * Create a ClamAV scanner instance.
   * @param host ClamAV server's host.
   * @param port ClamAV server's port.
   * @returns A scanner instance with scanning methods.
   */
  export function createScanner(host: string, port: number): Scanner;
}
