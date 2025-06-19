import { contextBridge, ipcRenderer, webUtils } from "electron";
import type { OpenDialogReturnValue } from "./lib/interfaces/OpenDialogReturnValue.interface";
import type { AppInfo } from "./lib/interfaces/AppInfo.interface";
import type { ApiResult } from "./lib/interfaces/ApiResult.interface";
import type { IStore } from "./lib/interfaces/Store.interface";
import type { AppEventT } from "./lib/types/AppEventT.type";
import type { CallbackT } from "./lib/types/CallbackT.type";

let wReady = false, wCompressed = false, wOpen = false, updateProgress: (percent: number) => unknown;
const units = ["Bytes", "KB", "MB", "GB"], apiUrl = ipcRenderer.sendSync("GetAppInfo").api;
const handlers: { [K in AppEventT]: { f: CallbackT<AppEventT>, once: boolean }[] } = {
    ready: [],
    open: [],
    close: [],
    login: [],
    uri: [],
    error: []
}

const _consoleLog = console.log, _consoleWarn = console.warn, _consoleError = console.error;
console.log = (...data: any[]) => (_consoleLog(...data), ipcRenderer.send("LoggerPreload", "info", ...data));
console.warn = (...data: any[]) => (_consoleWarn(...data), ipcRenderer.send("LoggerPreload", "warn", ...data));
console.error = (...data: any[]) => (_consoleError(...data), ipcRenderer.send("LoggerPreload", "error", ...data));

type TUpdateData = { version: string, date: string };

/**
 * Logs a message to the console (renderer)
 */
export function log(...data: any[]) {
    ipcRenderer.send("LoggerRenderer", "info", ...data);
}

/**
 * Logs a warning message to the console (renderer)
 */
export function warn(...data: any[]) {
    ipcRenderer.send("LoggerRenderer", "warn", ...data);
}

/**
 * Logs an error message to the console (renderer)
 */
export function error(...data: any[]) {
    ipcRenderer.send("LoggerRenderer", "error", ...data);
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
    console.log("Window Closed");
}

/**
 * Minimizes the current window
 */
export function minimizeWindow() {
    ipcRenderer.send("MinimizeWindow");
    console.log("Window Minimized");
}

/**
 * Compresses the current window
 */
export function compressWindow() {
    ipcRenderer.send("ResizeWindow", -1, !wCompressed ? 40 : -1);
    console.log(`Window ${!wCompressed ? "Compressed" : "Decompressed"}`);

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
export async function apiCall<T extends { [key: string]: unknown; }>(endpoint: string, { method, params, body }: { method?: string, params?: string, body?: object } = {}, error = true): Promise<T | undefined> {
    try {
        if (!navigator.onLine) {
            dispatch("error", "offline");
            return;
        }

        console.log("[API] " + endpoint + (params ? "?" + params : ""));
        method = method ?? "GET";

        const apiResult = await fetch(apiUrl + endpoint + (params ? "?" + params : ""), {
            method,
            body: body ? JSON.stringify(body) : undefined
        });

        const json = await apiResult.json() as ApiResult<T>;
        if (json.code !== "success") {
            console.error("[API] Return error: " + json.code);
            if (error)
                dispatch("error", "unknown");
        }

        return json.data;
    }
    catch (err) {
        console.error(err instanceof Error ? err.message : err);
        if (error)
            dispatch("error", "unknown");
        return;
    }
}

/**
 * Formats a size in bytes to the closest unit
 * @param size The size in bytes
 * @param decimals The number of decimals to display
 * @returns The formatted size in human readable format
 */
export function formatFileSize(size: number, decimals = 2) {
    let count = 0;

    do {
        size /= 1024;
        count++;
    }
    while (size > 1024);

    return size.toFixed(decimals) + " " + units[count];
}

/**
 * Saves a file to a specific location
 * @param file The file to be saved
 * @param location The location where to save the file
 */
export function saveToFile(file: ArrayBuffer, location: string) {
    ipcRenderer.send("SaveToFile", file, location);
}

/**
 * Object containing functions regarding the account system
 */
export const account = {
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
        
        /* const api = await apiCall({
            endpoint: "user/" + username,
            method: "PUT",
            body
        });

        if (api.code == 0 && api.value) {
            setSetting("account", { username: api.value.username, password });
            logger.log("Edit account successful");
        }

        return apiTranslator<T>(api); */
    },
    /**
     * Changes the password of a user account
     * @param username The username of the user
     * @param password The password of the user
     * @param newPassword The new password of the user
     * @returns An object containing one boolean with the success state
     */
    password: async <T>(username: string, password: string, newPassword: string) => {
       /*  const api = await apiCall({
            endpoint: "user/" + username + "/password",
            method: "PUT",
            body: { password, newPassword }
        });

        const encodedPass = ipcRenderer.sendSync("EncodePassword", newPassword);

        if (api.code == 0 && api.value) {
            setSetting("account", { username: api.value.username, password: encodedPass });
            logger.log("Edit account password successful");
        }

        return apiTranslator<T>(api, { password: encodedPass }); */
    },
    /**
     * Sends an email request from a specific user account
     * @param type The type of request desired
     * @param email The email of the user
     * @param language The preferred email language
     * @returns An object containing one boolean with the success state
     */
    request: async (type: "verify" | "recovery", email: string, language?: string) => {
       /*  const api = await apiCall({
            endpoint: "user/request",
            method: "POST",
            body: { type, email, language }
        });

        return apiTranslator(api); */
    },
    /**
     * Verifies an account using a verification token
     * @param email The email of the account to verify
     * @param verificationToken The verification token sent to the email
     * @returns An object containing one boolean with the success state
     */
    verify: async (email: string, verificationToken: string) => {
        /* const api = await apiCall({
            endpoint: "user/verify",
            method: "POST",
            body: { email, verificationToken }
        });

        return apiTranslator(api); */
    },
    /**
     * Recovers an account by setting a new password using a recovery token
     * @param email The email of the account to recover
     * @param password The new password to be set
     * @param recoveryToken The recovery token sent to the email
     * @returns An object containing one boolean with the success state
     */
    recovery: async (email: string, password: string, recoveryToken: string) => {
       /*  const api = await apiCall({
            endpoint: "user/recovery",
            method: "POST",
            body: { email, password, recoveryToken }
        });

        return apiTranslator(api); */
    },
    history: {
        /**
         * Obtains all history entries from a user
         * @param username The username of the user
         * @param password The password of the user
         * @returns An array containing all the entries
         */
        get: async <T>(username: string, password: string) => {
 /*            const api = await apiCall({
                endpoint: "user/" + username + "/history",
                method: "GET",
                params: new URLSearchParams({ password })
            });

            return apiTranslator<T>(api); */
        },
        /**
         * Clears all the entries of the user history
         * @param username The username of the user
         * @param password The password of the user
         * @returns An object containing one boolean with the success state
         */
        clear: async (username: string, password: string) => {
            /* const api = await apiCall({
                endpoint: "user/" + username + "/history",
                method: "DELETE",
                params: new URLSearchParams({ password })
            });

            return apiTranslator(api); */
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
        /* const api = await apiCall({
            endpoint: "user/" + username + "/settings",
            method: "PUT",
            body: { password, historyEnabled, showInfo }
        });

        return apiTranslator<T>(api); */
    },
    /**
     * Logs a user out
     */
    logout: () => {
        setSetting("account", { username: null, password: null });
        console.log("User logged out");
    },
    /**
     * Deletes a user account
     * @param username The usanme of the account to delete
     * @param password The password of the account to delete
     * @returns An object containing one boolean with the success state
     */
    delete: async (username: string, password: string) => {
        /* const encodedPass = ipcRenderer.sendSync("EncodePassword", password);

        const api = await apiCall({
            endpoint: "user/" + username,
            method: "DELETE",
            params: new URLSearchParams({ password: encodedPass })
        });

        return apiTranslator(api); */
    }
}

/**
 * Sends a login request to authenticate the user on the main window
 * @param username The username of the user
 * @param password The password of the user
 * @returns A boolean if the authentication on the main window was successful
 */
export async function sendLoginRequest(username: string, password: string) {
    console.log("Startup logging in...");

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

ipcRenderer.on("UriHandler", (_, url: string) => dispatch("uri", url));

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
    saveToFile,
    account,
    sendLoginRequest,
    sleep
});