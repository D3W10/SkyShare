import type { RTCEventT } from "./RTCEventT.type";

export type RTCCallbackT<T extends RTCEventT> = 
    T extends "data" ? (d: string) => unknown :
    T extends "dataOpen" ? () => unknown :
    T extends "file" ? (f: ArrayBuffer) => unknown :
    T extends "fileOpen" ? () => unknown :
    T extends "disconnect" ? () => unknown :
    T extends "end" ? () => unknown :
    never;