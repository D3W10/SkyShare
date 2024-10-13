import type { File } from "./File.interface";

export interface OpenDialogReturnValue {
    canceled: boolean;
    files: File[];
}