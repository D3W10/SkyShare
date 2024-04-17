import { writable } from "svelte/store";

interface IErrorStore {
    code: ErrorCode | null;
    type: string | null;
    show: boolean;
    vars?: { [key: string]: string };
}

export const error = (() => {
    const { subscribe, set } = writable<IErrorStore>({ code: null, type: null, show: false });

    return {
        subscribe,
        set: (code: ErrorCode, vars?: { [key: string]: any }) => set({ code, type: errorList[code], show: true, vars }),
        setLocal: (id: string, vars?: { [key: string]: any }) => set({ code: null, type: id, show: true, vars }),
        hide: () => set({ code: null, type: null, show: false })
    }
})();

export enum ErrorCode {
    OFFLINE = -2, SERVER_ERROR = -1,
    MISSING_PARAMETER = 1, NO_PARAMETERS,
    INVALID_USERNAME, INVALID_EMAIL,
    INVALID_PASSWORD, INVALID_NEW_PASSWORD,
    WRONG_USERPASS, USERNAME_UNAVAILABLE,
    UNKNOWN_SIGNUP,
    // 10 EMPTY SLOT
    PHOTO_TOO_BIG, // 20
    INVALID_PHOTO, // 21
    TOO_MANY_FILES, // 24
    SIZE_LIMIT_EXCEEDED // 25
}

const errorList = {
    [ErrorCode.OFFLINE]: "offline",
    [ErrorCode.SERVER_ERROR]: "miscommunication",
    [ErrorCode.MISSING_PARAMETER]: "miscommunication",
    [ErrorCode.NO_PARAMETERS]: "miscommunication",
    [ErrorCode.INVALID_USERNAME]: "invalidUsername",
    [ErrorCode.INVALID_EMAIL]: "invalidEmail",
    [ErrorCode.INVALID_PASSWORD]: "invalidPassword",
    [ErrorCode.INVALID_NEW_PASSWORD]: "",
    [ErrorCode.WRONG_USERPASS]: "wrongUserPass",
    [ErrorCode.USERNAME_UNAVAILABLE]: "usernameUnavailable",
    [ErrorCode.UNKNOWN_SIGNUP]: "unknownSignup",
    [ErrorCode.PHOTO_TOO_BIG]: "photoTooBig",
    [ErrorCode.INVALID_PHOTO]: "invalidPhoto",
    [ErrorCode.TOO_MANY_FILES]: "tooManyFiles",
    [ErrorCode.SIZE_LIMIT_EXCEEDED]: "sizeLimitExceeded"
}