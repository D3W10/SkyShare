import { contextBridge, ipcRenderer } from "electron";
import type { OpenDialogReturnValue } from "./lib/OpenDialogReturnValue.interface";

let wReady: boolean = false, wCompressed: boolean = false;
let isOffline: () => boolean, winReady: () => unknown, cfuProgress: (percent: number) => unknown, loginHandler: (username: string, password: string) => Promise<boolean>, uriHandler: (args: string[]) => unknown, errorHandler: (code: number) => unknown;
const units = ["Bytes", "KB", "MB", "GB"], apiUrl: string = ipcRenderer.sendSync("GetAppInfo").api;

const logger =  {
    log: (msg: string) => ipcRenderer.send("LoggerPreload", "info", msg),
    error: (msg: string) => ipcRenderer.send("LoggerPreload", "error", msg)
}

export interface AppInfo {
    name: string;
    version: string;
    api: string;
}

export interface ApiResult {
    code: number;
    message: string;
    value?: any;
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
export function checkForUpdates(statusCallback: (available: boolean) => unknown, progressCallback: (percent: number) => unknown) {
    ipcRenderer.send("CheckForUpdates");

    ipcRenderer.once("CFUStatus", (_, available: boolean) => statusCallback(available));
    cfuProgress = progressCallback;
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
export function getSetting(key: string) {
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
 * Obtains the icon of a file stored on the filesystem
 * @param path The path to the file to get the icon from
 * @returns The base64 encoded png icon
 */
export async function getFileIcon(path: string) {
    return await ipcRenderer.invoke("GetFileIcon", path);
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
        if (isOffline()) {
            errorHandler(-2);
            return {} as ApiResult;
        }

        const apiResult = await fetch(apiUrl + endpoint + (params ? "?" + params : ""), {
            method,
            body: body ? JSON.stringify(body) : undefined
        });

        const json = await apiResult.json() as ApiResult;
        if (json.code != 0 && errorHandler) {
            logger.error("API threw an error with code " + json.code);
            if (error)
                errorHandler(json.code);
        }

        return json;
    }
    catch (err) {
        logger.error(String(err));
        errorHandler(-1);

        return {} as ApiResult;
    }
}

/**
 * Formats a size in bytes to the closest unit
 * @param size The size in bytes
 * @returns The formatted size in human readable format
 */
export function fileSizeFormat(size: number) {
    let count: number = 0;

    do {
        size /= 1024;
        count++;
    }
    while (size > 1024);

    return size.toFixed(2) + " " + units[count];
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
     * @returns A boolean indicating whether the login was successful or not
     */
    login: async (username: string, password: string, encrypted: boolean = false) => {
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

        return api.code == 0;
    },
    logout: () => {
        setSetting("account", { username: null, password: null });
        logger.log("User logged out");
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
    return new Promise((resolve) => ipcRenderer.once("LoginRequestFulfilled", (_, result: boolean) => resolve(result)));
}

/**
 * Stops the program execution for the specified amount of time
 */
export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Updates the callback function that allows preload to get the current offline status
 * @param callback The function that returns the offline status
 */
export function updateOfflineCallback(callback: () => boolean) {
    isOffline = callback;
}

/**
 * Updates the callback function reference to where the main window status should be sent
 * @param callback The function to receive the window status
 */
export function updateReadyCallback(callback: () => unknown) {
    winReady = callback;
    if (wReady)
        callback();
}

/**
 * Updates the callback function reference to where the login result should be sent
 * @param callback The function to receive the login result
 */
export function updateLoginCallback(callback: (username: string, password: string) => Promise<boolean>) {
    loginHandler = callback;
}

/**
 * Updates the callback function reference to where the API errors should be sent
 * @param callback The function to receive the API error codes
 */
export function updateErrorCallback(callback: (code: number) => unknown) {
    errorHandler = callback;
}

ipcRenderer.on("CFUProgress", (_, percent: number) => cfuProgress(percent));

ipcRenderer.on("WindowReady", () => {
    if (winReady)
        winReady();
    else
        wReady = true;
});

ipcRenderer.on("LoginRequest", async (_, username: string, password: string) => ipcRenderer.send("LoginRequestFulfilled", await loginHandler(username, password)));

contextBridge.exposeInMainWorld("app", {
    log,
    warn,
    error,
    checkForUpdates,
    closeWindow,
    minimizeWindow,
    compressWindow,
    openMain,
    getSetting,
    setSetting,
    resetSettings,
    getAppInfo,
    getFileIcon,
    isDirectory,
    showOpenDialog,
    showSaveDialog,
    apiCall,
    fileSizeFormat,
    account,
    sendLoginRequest,
    sleep,
    updateOfflineCallback,
    updateReadyCallback,
    updateLoginCallback,
    updateErrorCallback
});