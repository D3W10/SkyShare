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
    INVALID_PASSWORD, INVALID_NEW_USERNAME,
    INVALID_NEW_EMAIL, INVALID_NEW_PASSWORD,
    WRONG_USERPASS, USERNAME_UNAVAILABLE,
    EMAIL_UNAVAILABLE, PHOTO_TOO_BIG,
    INVALID_PHOTO, UNKNOWN_SIGNUP,
    INVALID_REQUEST_TYPE, INVALID_VERIFICATION_TOKEN,
    INVALID_RECOVERY_TOKEN, UNKNOWN_EDIT,
    UNKNOWN_PASSWORD, UNKNOWN_HISTORY,
    MESSAGE_TOO_LONG,

    
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
    [ErrorCode.INVALID_NEW_USERNAME]: "invalidNewUsername",
    [ErrorCode.INVALID_NEW_EMAIL]: "invalidNewEmail",
    [ErrorCode.INVALID_NEW_PASSWORD]: "invalidNewPassword",
    [ErrorCode.WRONG_USERPASS]: "wrongUserPass",
    [ErrorCode.USERNAME_UNAVAILABLE]: "usernameUnavailable",
    [ErrorCode.EMAIL_UNAVAILABLE]: "emailUnavailable",
    [ErrorCode.PHOTO_TOO_BIG]: "photoTooBig",
    [ErrorCode.INVALID_PHOTO]: "invalidPhoto",
    [ErrorCode.UNKNOWN_SIGNUP]: "unknownSignup",
    [ErrorCode.INVALID_REQUEST_TYPE]: "miscommunication",
    [ErrorCode.INVALID_VERIFICATION_TOKEN]: "invalidVerificationToken",
    [ErrorCode.INVALID_RECOVERY_TOKEN]: "invalidRecoveryToken",
    [ErrorCode.UNKNOWN_EDIT]: "unknownEdit",
    [ErrorCode.UNKNOWN_PASSWORD]: "unknownPassword",
    [ErrorCode.UNKNOWN_HISTORY]: "unknownHistory",
    [ErrorCode.MESSAGE_TOO_LONG]: "messageTooLong",
    [ErrorCode.TOO_MANY_FILES]: "tooManyFiles",
    [ErrorCode.SIZE_LIMIT_EXCEEDED]: "sizeLimitExceeded"
};