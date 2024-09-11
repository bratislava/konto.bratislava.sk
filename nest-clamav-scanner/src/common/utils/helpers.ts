import { isString } from 'class-validator';
import { FileStatus } from '@prisma/client';

export function isValid(resource: any): boolean {
  if (!isString(resource)) {
    return false;
  }

  if (resource.length < 3) {
    return false;
  }

  if (resource.length > 1000) {
    return false;
  }

  return true;
}

export const isDefined = (a: unknown) => a !== undefined;

// function which checks if string is in base64 format
export function isBase64(str: string): boolean {
  const base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  return base64regex.test(str);
}

//check if scan status is valid
export function isValidScanStatus(status: string): boolean {
  return Object.values(FileStatus).includes(status as FileStatus);
}

// return list of statuses in string
export function listOfStatuses(): string {
  return Object.values(FileStatus).toString();
}

//function which splits array into chunks of size n
export function chunkArray<T>(arr: T[], n: number): T[][] {
  const chunks = [];
  for (let i = 0; i < arr.length; i += n) {
    chunks.push(arr.slice(i, i + n));
  }
  return chunks;
}

export function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(FileStatus.SCAN_TIMEOUT), ms);
  });
}
