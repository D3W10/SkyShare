import { writable } from "svelte/store";

interface IErrorStore {
    type: string | null;
    show: boolean;
    vars?: { [key: string]: string };
}

export const error = (() => {
    const { subscribe, set } = writable<IErrorStore>({ type: null, show: false });

    return {
        subscribe,
        set: (type: ErrorCode, vars?: { [key: string]: any }) => set({ type: errorList[type], show: true, vars }),
        hide: () => set({ type: null, show: false })
    }
})();

export enum ErrorCode {
    MISSING_PARAMETER = 1, NO_PARAMETERS,
    INVALID_USERNAME, INVALID_EMAIL,
    INVALID_PASSWORD,
    INVALID_NEW_PASSWORD,
    WRONG_USERPASS,
    USERNAME_UNAVAILABLE,
    UNKNOWN_SIGNUP,
    // 10 EMPTY SLOT
    PHOTO_TOO_BIG, // 20
    INVALID_PHOTO // 21
}

const errorList = {
    [ErrorCode.MISSING_PARAMETER]: "miscommunication",
    [ErrorCode.NO_PARAMETERS]: "miscommunication",
    [ErrorCode.INVALID_USERNAME]: "invalidUsername",
    [ErrorCode.INVALID_EMAIL]: "invalidEmail",
    [ErrorCode.INVALID_PASSWORD]: "",
    [ErrorCode.INVALID_NEW_PASSWORD]: "",
    [ErrorCode.WRONG_USERPASS]: "wrongUserPass",
    [ErrorCode.USERNAME_UNAVAILABLE]: "",
    [ErrorCode.UNKNOWN_SIGNUP]: "",
    [ErrorCode.PHOTO_TOO_BIG]: "",
    [ErrorCode.INVALID_PHOTO]: ""
}