import type { AppEventT } from "./AppEventT.type";
import type { ErrorT } from "./ErrorT.type";

export type CallbackT<T extends AppEventT> = 
    T extends "ready" ? () => unknown :
    T extends "open" ? () => unknown :
    T extends "close" ? () => unknown :
    T extends "login" ? () => Promise<unknown> :
    T extends "loginFulfilled" ? (success: boolean) => unknown :
    T extends "uri" ? (url: string) => unknown :
    T extends "error" ? (code: ErrorT, vars?: { [key: string]: any }) => unknown :
    never;