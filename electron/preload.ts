import { contextBridge, ipcRenderer, webUtils } from "electron";
import type { OpenDialogReturnValue } from "./lib/interfaces/OpenDialogReturnValue.interface";
import type { AppInfo } from "./lib/interfaces/AppInfo.interface";
import type { ApiResult } from "./lib/interfaces/ApiResult.interface";
import type { TransferInfo } from "./lib/interfaces/TransferInfo.interface";
import type { TransferData } from "./lib/interfaces/TransferData.interface";
import type { AnswerInfo } from "./lib/interfaces/AnswerInfo.interface";
import type { IceCandidate } from "./lib/interfaces/IceCandidate.interface";
import type { IStore } from "./lib/interfaces/Store.interface";
import type { AppEventT } from "./lib/types/AppEventT.type";
import type { CallbackT } from "./lib/types/CallbackT.type";

let wReady = false, wCompressed = false, wOpen = false, updateProgress: (percent: number) => unknown;
const units = ["Bytes", "KB", "MB", "GB"], apiUrl: string = ipcRenderer.sendSync("GetAppInfo").api;
const handlers: Record<AppEventT, { f: CallbackT<AppEventT>, once: boolean }[]> = {
    ready: [],
    open: [],
    close: [],
    login: [],
    uri: [],
    error: []
}

const logger = {
    log: (msg: string) => ipcRenderer.send("LoggerPreload", "info", msg),
    error: (msg: string) => ipcRenderer.send("LoggerPreload", "error", msg)
};

type TDataObj<T> = T extends {} ? keyof T extends never ? { [key: string]: any } : T : T;
type TUpdateData = { version: string, date: string };

interface ApiCall<T> {
    success: boolean;
    data: T;
}

function apiTranslator<T = void>(res: ApiResult, add: { [key: string]: any } = {}): ApiCall<TDataObj<T>> {
    const resGen = (data: any) => ({ success: res.code == 0, data }) as ApiCall<TDataObj<T>>;

    if (res.code == 0 && res.value && res.value instanceof Object) {
        if (!Array.isArray(res.value)) {
            const data = { ...res.value, ...add } as TDataObj<{}>;

            if (data.createdAt)
                data.createdAt = new Date(data.createdAt);

            return resGen(data);
        }
        else
            return resGen(res.value as TDataObj<any[]>);
    }

    return resGen(res.value);
}

/**
 * Logs a message to the console
 */
export function log(msg: any) {
    ipcRenderer.send("LoggerRenderer", "info", msg);
}

/**
 * Logs a warning message to the console
 */
export function warn(msg: any) {
    ipcRenderer.send("LoggerRenderer", "warn", msg);
}

/**
 * Logs an error message to the console
 */
export function error(msg: any) {
    ipcRenderer.send("LoggerRenderer", "error", msg);
}

/**
 * Checks if there's an update available for the app passing the result to the statusCallback, if there's an update available the progressCallback is called with the percentage of the download
 * @param statusCallback The function to receive the update status
 * @param progressCallback The function to receive the download progress
 */
export function checkForUpdates(statusCallback: (available: boolean, data: TUpdateData) => unknown, progressCallback: (percent: number) => unknown) {
    ipcRenderer.send("CheckForUpdates");

    ipcRenderer.once("CFUStatus", (_, available: boolean, data: TUpdateData) => statusCallback(available, data));
    updateProgress = progressCallback;
}

/**
 * Closes the current window
 */
export function closeWindow() {
    ipcRenderer.send("CloseWindow");
    logger.log("Window Closed");
}

/**
 * Minimizes the current window
 */
export function minimizeWindow() {
    ipcRenderer.send("MinimizeWindow");
    logger.log("Window Minimized");
}

/**
 * Compresses the current window
 */
export function compressWindow() {
    ipcRenderer.send("ResizeWindow", -1, !wCompressed ? 40 : -1);
    logger.log(`Window ${!wCompressed ? "Compressed" : "Decompressed"}`);

    wCompressed = !wCompressed;
}

/**
 * Notifies the splash window that the main window is ready
 */
export function winReady() {
    ipcRenderer.send("WindowReady");
}

/**
 * Closes the splash window and reveals the main one
 */
export function openMain() {
    ipcRenderer.send("OpenMain");
}

/**
 * Obtains a setting by it's key from the settings file
 * @param key The key of the setting you want to get
 * @returns The setting value
 */
export function getSetting<T extends keyof IStore>(key: T): IStore[T] {
    return ipcRenderer.sendSync("GetSetting", key);
}

/**
 * Defines a new value for a specific setting
 * @param key The key of the setting you want to set
 * @param value The new value of the setting
 */
export function setSetting(key: string, value: any) {
    return ipcRenderer.send("SetSetting", key, value);
}

/**
 * Resets all settings to their default values
 */
export function resetSettings() {
    return ipcRenderer.send("ResetSettings");
}

/**
 * Obtains the application info
 * @returns The application info
 */
export function getAppInfo() {
    return ipcRenderer.sendSync("GetAppInfo") as AppInfo;
}

/**
 * Obtains the platform the app is running on
 * @returns The platform the app is running on
 */
export function getPlatform() {
    return ipcRenderer.sendSync("GetPlatform") as NodeJS.Platform;
}

/**
 * Obtains the icon of a file stored on the filesystem
 * @param path The path to the file to get the icon from
 * @returns The base64 encoded png icon
 */
export async function getFileIcon(path: string) {
    return await ipcRenderer.invoke("GetFileIcon", path);
}

/**
 * Obtains the path to a file stored on the filesystem
 * @param file The file to get the path from
 * @returns The path to the file
 */
export function getFilePath(file: File) {
    return webUtils.getPathForFile(file);
}

/**
 * Checks if the provided path is a file or a folder
 * @param path The path to the file or folder
 * @returns A boolean indicating whether the provided path is a file or a folder
 */
export async function isDirectory(path: string) {
    return await ipcRenderer.invoke("IsDirectory", path);
}

/**
 * Adds a listener for various in-app events
 * @param name The name of the event to bind to
 * @param callback The callback to bind to the event
 * @param options An object containing the options for the event
 * @param options.once A boolean indicating whether the event should be called only once
 */
export function addEventListener<T extends AppEventT>(name: T, callback: CallbackT<T>, { once = false } = {}) {
    handlers[name].push({ f: callback, once });

    if (name === "ready" && wReady)
        (callback as CallbackT<"ready">)();
    else if (name === "open" && wOpen)
        (callback as CallbackT<"open">)();
}

/**
 * Notifies all listeners about a specific event
 * @param name The name of the event to notify
 * @param args Aditional arguments to pass to the callback
 */
export function dispatch<T extends AppEventT>(name: T, ...args: Parameters<CallbackT<T>>) {
    handlers[name].forEach(c => (c.f as Function)(...args));
    handlers[name] = handlers[name].filter(c => !c.once);
}

/**
 * Opens the system open file dialog
 * @param options The options for the open dialog
 * @returns An object containing the information of the selected file, if one was selected
 */
export async function showOpenDialog(options: Electron.OpenDialogOptions): Promise<OpenDialogReturnValue> {
    return await ipcRenderer.invoke("ShowOpenDialog", options);
}

/**
 * Opens the system save file dialog
 * @param options The options for the save dialog
 * @returns An object containing the information of the selected folder, if one was selected
 */
export async function showSaveDialog(options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue> {
    return await ipcRenderer.invoke("ShowSaveDialog", options);
}

/**
 * Makes a call to the API
 * @param options An object containing the endpoint to reach, the HTTP method and the parameters/body to send
 * @param error A boolean indicating whether the error should be handled by the native error system
 * @returns A JSON containing the code, message and returned value
 */
export async function apiCall({ endpoint, method, params, body }: { endpoint: string, method: string, params?: URLSearchParams, body?: object }, error: boolean = true): Promise<ApiResult> {
    try {
        if (!navigator.onLine) {
            dispatch("error", -2);
            return {} as ApiResult;
        }

        logger.log("API call made: " + apiUrl + endpoint + (params ? "?" + params : ""));

        const apiResult = await fetch(apiUrl + endpoint + (params ? "?" + params : ""), {
            method,
            body: body ? JSON.stringify(body) : undefined
        });

        const json = await apiResult.json() as ApiResult;
        if (json.code !== 0) {
            logger.error("API threw an error with code " + json.code);
            if (error)
                dispatch("error", json.code);
        }

        return json;
    }
    catch (err) {
        logger.error(String(err));
        dispatch("error", -1);

        return {} as ApiResult;
    }
}

/**
 * Formats a size in bytes to the closest unit
 * @param size The size in bytes
 * @param decimals The number of decimals to display
 * @returns The formatted size in human readable format
 */
export function formatFileSize(size: number, decimals: number = 2) {
    let count = 0;

    do {
        size /= 1024;
        count++;
    }
    while (size > 1024);

    return size.toFixed(decimals) + " " + units[count];
}

/**
 * Obtains the list of servers to use for transfers
 */
export async function fetchServers() {
    const api = await apiCall({
        endpoint: "file/servers",
        method: "GET"
    });

    ipcRenderer.send("StoreServers", api.value);
}

/**
 * Obtains the servers from the main process
 * @returns The list of servers to use for the RTC connection
 */
export function getServers() {
    return ipcRenderer.sendSync("GetServers");
}

/**
 * Creates a new transfer channel
 * @param offer The RTC offer to assign to the remote peer
 * @returns An object containing one boolean with the success state and info about the newly created transfer channel
 */
export async function createTransfer(offer: RTCSessionDescriptionInit) {
    const api = await apiCall({
        endpoint: "file/create",
        method: "POST",
        body: {
            offer
        }
    });

    return apiTranslator<TransferInfo>(api);
}

/**
 * Waits for the other peer to send the RTC answer
 * @param code The transfer code
 * @param callback The function to be called when the answer has been sent by the other peer
 */
export async function waitTransferConnection(code: string, callback: (data: TransferData) => unknown) {
    ipcRenderer.send("WaitForAnswer", code);
    ipcRenderer.once("WaitForAnswerFulfilled", (_, data) => callback(data));
}

/**
 * Checks if a certain transfer exists or not
 * @param code The transfer code
 * @returns The transfer data if it exists, null otherwise
 */
export async function checkTransfer(code: string): Promise<TransferData | null> {
    return await ipcRenderer.invoke("CheckTransfer", code);
}

/**
 * Sends the RTC answer to the other peer
 * @param code The transfer code
 * @param answer The RTC answer to give to the other peer
 * @returns An object containing one boolean with the success state and the token to access the transfer
 */
export async function answerTransfer(code: string, answer: RTCSessionDescriptionInit) {
    const api = await apiCall({
        endpoint: "file/" + code,
        method: "POST",
        body: {
            answer
        }
    });

    return apiTranslator<AnswerInfo>(api);
}

/**
 * Adds an ICE candidate to an existing transfer
 * @param code The transfer code
 * @param candidates One or more RTC ICE candidates to add to the remote peer
 * @param token The token of the transfer
 * @returns An object containing one boolean with the success state
 */
export async function sendIceCandidate(code: string, candidates: IceCandidate[], token: string) {
    const api = await apiCall({
        endpoint: "file/" + code + "/ice",
        method: "POST",
        body: {
            candidates,
            token
        }
    });

    return apiTranslator<void>(api);
}

/**
 * Listens for ICE candidates for a specific transfer
 * @param code The transfer code
 * @param callback The function to be called when an ICE candidate is received
 * @returns A unsubscribe function that should be called when the connection has been established
 */
export function listenForIce(code: string, callback: (data: IceCandidate) => unknown) {
    ipcRenderer.send("ListenForIce", code);
    ipcRenderer.on("IceReceived", (_, data: IceCandidate) => callback({ candidate: data.candidate, sdpMid: data.sdpMid, sdpMLineIndex: data.sdpMLineIndex }));

    return () => ipcRenderer.send("StopListeningForIce");
}

/**
 * Object containing functions regarding the account system
 */
export const account = {
    /**
     * Logs a user in if they have an account
     * @param username The username of the user
     * @param password The password of the user
     * @param encrypted Should be true if the password is already encrypted, false otherwise
     * @returns An object containing one boolean with the success state and info about the user if it was successful
     */
    login: async <T>(username: string, password: string, encrypted: boolean = false) => {
        const encodedPass = !encrypted ? ipcRenderer.sendSync("EncodePassword", password) : password;

        const api = await apiCall({
            endpoint: "user/login",
            method: "GET",
            params: new URLSearchParams({ username, password: encodedPass })
        }, !encrypted);

        if (api.code == 0) {
            setSetting("account", { username, password: encodedPass });
            logger.log("Log in successful");
        }

        return apiTranslator<T>(api, { password: encodedPass });
    },
    /**
     * Checks if a username and email are available to be picked
     * @param username The pretended username
     * @param username The pretended email
     * @returns An object containing one boolean with the success state and the state if the username and email are available or not
     */
    check: async <T>(username: string, email: string) => {
        const api = await apiCall({
            endpoint: "user/check",
            method: "GET",
            params: new URLSearchParams({ username, email })
        });

        return apiTranslator<T>(api);
    },
    /**
     * Creates a new user account
     * @param username The username of the user
     * @param email The email of the user
     * @param password The password of the user
     * @param photo The photo of the user or null if no photo should be set
     * @param language The preferred email language
     * @returns An object containing one boolean with the success state and info about the newly created user if it was successful
     */
    signup: async <T>(username: string, email: string, password: string, photo: string | null, language?: string) => {
        let body = { username, email, password, language };
        const encodedPass = ipcRenderer.sendSync("EncodePassword", password);

        if (photo)
            Object.assign(body, { photo: await ipcRenderer.invoke("GetFileAsBase64", photo) });

        const api = await apiCall({
            endpoint: "user/signup",
            method: "POST",
            body
        });

        if (api.code == 0) {
            setSetting("account", { username, password: encodedPass });
            logger.log("Sign up successful");
        }

        return apiTranslator<T>(api, { password: encodedPass });
    },
    /**
     * Edits the information of a user account
     * @param username The username of the user
     * @param password The password of the user
     * @param editUsername The new username of the user or undefined to leave as is
     * @param email The new email of the user or undefined to leave as is
     * @param photo The new photo of the user, null to remove the photo or undefined to leave as is
     * @param language The preferred email language
     * @returns An object containing one boolean with the success state
     */
    edit: async <T>(username: string, password: string, editUsername: string | undefined, email: string | undefined, photo: string | null | undefined, language?: string) => {
        let body = { password, language };

        if (editUsername)
            Object.assign(body, { username: editUsername });
        if (email)
            Object.assign(body, { email });
        if (photo)
            Object.assign(body, { photo: await ipcRenderer.invoke("GetFileAsBase64", photo) });
        else if (photo === null)
            Object.assign(body, { photo: null });
        
        const api = await apiCall({
            endpoint: "user/" + username,
            method: "PUT",
            body
        });

        if (api.code == 0 && api.value) {
            setSetting("account", { username: api.value.username, password });
            logger.log("Edit account successful");
        }

        return apiTranslator<T>(api);
    },
    /**
     * Changes the password of a user account
     * @param username The username of the user
     * @param password The password of the user
     * @param newPassword The new password of the user
     * @returns An object containing one boolean with the success state
     */
    password: async <T>(username: string, password: string, newPassword: string) => {
        const api = await apiCall({
            endpoint: "user/" + username + "/password",
            method: "PUT",
            body: { password, newPassword }
        });

        const encodedPass = ipcRenderer.sendSync("EncodePassword", newPassword);

        if (api.code == 0 && api.value) {
            setSetting("account", { username: api.value.username, password: encodedPass });
            logger.log("Edit account password successful");
        }

        return apiTranslator<T>(api, { password: encodedPass });
    },
    /**
     * Sends an email request from a specific user account
     * @param type The type of request desired
     * @param email The email of the user
     * @param language The preferred email language
     * @returns An object containing one boolean with the success state
     */
    request: async (type: "verify" | "recovery", email: string, language?: string) => {
        const api = await apiCall({
            endpoint: "user/request",
            method: "POST",
            body: { type, email, language }
        });

        return apiTranslator(api);
    },
    /**
     * Verifies an account using a verification token
     * @param email The email of the account to verify
     * @param verificationToken The verification token sent to the email
     * @returns An object containing one boolean with the success state
     */
    verify: async (email: string, verificationToken: string) => {
        const api = await apiCall({
            endpoint: "user/verify",
            method: "POST",
            body: { email, verificationToken }
        });

        return apiTranslator(api);
    },
    /**
     * Recovers an account by setting a new password using a recovery token
     * @param email The email of the account to recover
     * @param password The new password to be set
     * @param recoveryToken The recovery token sent to the email
     * @returns An object containing one boolean with the success state
     */
    recovery: async (email: string, password: string, recoveryToken: string) => {
        const api = await apiCall({
            endpoint: "user/recovery",
            method: "POST",
            body: { email, password, recoveryToken }
        });

        return apiTranslator(api);
    },
    history: {
        /**
         * Obtains all history entries from a user
         * @param username The username of the user
         * @param password The password of the user
         * @returns An array containing all the entries
         */
        get: async <T>(username: string, password: string) => {
            const api = await apiCall({
                endpoint: "user/" + username + "/history",
                method: "GET",
                params: new URLSearchParams({ password })
            });

            return apiTranslator<T>(api);
        },
        /**
         * Clears all the entries of the user history
         * @param username The username of the user
         * @param password The password of the user
         * @returns An object containing one boolean with the success state
         */
        clear: async (username: string, password: string) => {
            const api = await apiCall({
                endpoint: "user/" + username + "/history",
                method: "DELETE",
                params: new URLSearchParams({ password })
            });

            return apiTranslator(api);
        }
    },
    /**
     * Edits the settings of a user account
     * @param username The username of the user
     * @param password The password of the user
     * @param historyEnabled A value that specifies whether the history should be enabled or not
     * @param showInfo A value that specifies whether the user's info should be displayed on transfers or not
     * @returns An object containing one boolean with the success state
     */
    settings: async <T>(username: string, password: string, historyEnabled: boolean, showInfo: boolean) => {
        const api = await apiCall({
            endpoint: "user/" + username + "/settings",
            method: "PUT",
            body: { password, historyEnabled, showInfo }
        });

        return apiTranslator<T>(api);
    },
    /**
     * Logs a user out
     */
    logout: () => {
        setSetting("account", { username: null, password: null });
        logger.log("User logged out");
    },
    /**
     * Deletes a user account
     * @param username The usanme of the account to delete
     * @param password The password of the account to delete
     * @returns An object containing one boolean with the success state
     */
    delete: async (username: string, password: string) => {
        const encodedPass = ipcRenderer.sendSync("EncodePassword", password);

        const api = await apiCall({
            endpoint: "user/" + username,
            method: "DELETE",
            params: new URLSearchParams({ password: encodedPass })
        });

        return apiTranslator(api);
    }
}

/**
 * Sends a login request to authenticate the user on the main window
 * @param username The username of the user
 * @param password The password of the user
 * @returns A boolean if the authentication on the main window was successful
 */
export async function sendLoginRequest(username: string, password: string) {
    logger.log("Startup logging in...");

    ipcRenderer.send("LoginRequest", username, password);
    return new Promise(resolve => ipcRenderer.once("LoginRequestFulfilled", (_, result: boolean) => resolve(result)));
}

/**
 * Stops the program execution for the specified amount of time
 */
export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

ipcRenderer.on("CFUProgress", (_, percent: number) => updateProgress(percent));

ipcRenderer.on("WindowReady", () => {
    dispatch("ready");
    wReady = true;
});

ipcRenderer.on("WindowOpen", () => {
    dispatch("open");
    wOpen = true;
});

ipcRenderer.on("WindowClose", () => dispatch("close"));

ipcRenderer.on("LoginRequest", (_, username: string, password: string) => ipcRenderer.send("LoginRequestFulfilled", dispatch("login", username, password)));

ipcRenderer.on("UriHandler", (_, args: string[]) => dispatch("uri", args));

contextBridge.exposeInMainWorld("app", {
    log,
    warn,
    error,
    checkForUpdates,
    closeWindow,
    minimizeWindow,
    compressWindow,
    winReady,
    openMain,
    getSetting,
    setSetting,
    resetSettings,
    getAppInfo,
    getPlatform,
    getFileIcon,
    getFilePath,
    isDirectory,
    addEventListener,
    dispatch,
    showOpenDialog,
    showSaveDialog,
    apiCall,
    formatFileSize,
    fetchServers,
    getServers,
    createTransfer,
    waitTransferConnection,
    checkTransfer,
    answerTransfer,
    sendIceCandidate,
    listenForIce,
    account,
    sendLoginRequest,
    sleep
});