import { contextBridge, ipcRenderer } from "electron";
import type { OpenDialogReturnValue } from "./lib/OpenDialogReturnValue.interface";

let wReady = false, winReady: () => unknown, cfuProgress: (percent: number) => unknown, errorHandler: (code: number) => unknown;
const pLog = (msg: string) => ipcRenderer.send("LoggerPreload", "info", msg);
const units = ["Bytes", "KB", "MB", "GB"], apiUrl: string = ipcRenderer.sendSync("GetAppInfo").api;

export interface AppInfo {
    name: string;
    version: string;
    api: string;
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
 * 
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
    pLog("Window Closed");
}

/**
 * Minimizes the current window
 */
export function minimizeWindow() {
    ipcRenderer.send("MinimizeWindow");
    pLog("Window Minimized");
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
 * @returns A JSON containing the code, message and returned value
 */
export async function apiCall({ endpoint, method, params, body }: { endpoint: string, method: string, params?: URLSearchParams, body?: object }) {
    const apiResult = await fetch(apiUrl + endpoint + (params ? "?" + params : ""), {
        method,
        body: body ? JSON.stringify(body) : undefined
    });

    const json = await apiResult.json() as { code: number, message: string, value?: any };
    if (json.code != 0)
        errorHandler(json.code);

    return json;
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
     * @returns A boolean indicating whether the login was successful or not
     */
    login: async (username: string, password: string) => {
        const encodedPass = ipcRenderer.sendSync("EncodePassword", password);

        const api = await apiCall({
            endpoint: "user/login",
            method: "GET",
            params: new URLSearchParams({ username, password: encodedPass })
        });

        if (api.code == 0)
            setSetting("account", { username, password: encodedPass });

        return api.code == 0;
    }
}

/**
 * Stops the program execution for the specified amount of time
 */
export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Updates the callback function reference to where the main window status should be sent
 * 
 * @param callback The function to receive the window status
 */
export function updateReadyCallback(callback: () => unknown) {
    winReady = callback;
    if (wReady)
        callback();
}

/**
 * Updates the callback function reference to where the API errors should be sent
 * 
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

contextBridge.exposeInMainWorld("app", {
    log,
    warn,
    error,
    checkForUpdates,
    closeWindow,
    minimizeWindow,
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
    sleep,
    updateReadyCallback,
    updateErrorCallback
});