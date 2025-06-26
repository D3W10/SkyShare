import { contextBridge, ipcRenderer, webUtils } from "electron";
import { ErrorT } from "./lib/types/ErrorT.type";
import type { JwtPayload } from "jsonwebtoken";
import type { OpenDialogReturnValue } from "./lib/interfaces/OpenDialogReturnValue.interface";
import type { AppInfo } from "./lib/interfaces/AppInfo.interface";
import type { ApiResult } from "./lib/interfaces/ApiResult.interface";
import type { IStore } from "./lib/interfaces/Store.interface";
import type { AppEventT } from "./lib/types/AppEventT.type";
import type { CallbackT } from "./lib/types/CallbackT.type";

let wReady = false, wCompressed = false, wOpen = false, wLogin = false;
let updateProgress: (percent: number) => unknown;
const units = ["Bytes", "KB", "MB", "GB"], apiUrl = ipcRenderer.sendSync("GetAppInfo").api;
const handlers: { [K in AppEventT]: { f: CallbackT<AppEventT>, once: boolean }[] } = {
    ready: [],
    open: [],
    close: [],
    login: [],
    loginFulfilled: [],
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
    else if (name === "login" && wLogin)
        (callback as CallbackT<"login">)();
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
 * @returns A tuple containing the success state of the operation and an object containing the data returned by the API
 */
export async function apiCall<T extends { [key: string]: unknown; }>(endpoint: string, { method, params, body }: { method?: string, params?: string, body?: object } = {}, error = true): Promise<["", T] | [ErrorT, null]> {
    try {
        if (!navigator.onLine) {
            dispatch("error", "offline");
            return ["offline", null];
        }

        console.log("[API] " + endpoint + (params ? "?" + params : ""));
        method = method ?? "GET";

        const apiResult = await fetch(apiUrl + endpoint + (params ? "?" + params : ""), {
            method,
            body: body ? JSON.stringify(body) : undefined
        });

        const json = await apiResult.json() as ApiResult<T>;
        if (json.code !== "success" || !json.data) {
            console.error("[API] Return error: " + json.code);
            if (error)
                dispatch("error", "unknown");

            return ["unknown", null];
        }

        return ["", json.data];
    }
    catch (err) {
        console.error(err instanceof Error ? err.message : err);
        if (error)
            dispatch("error", "unknown");

        return ["unknown", null];
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
 * Formats a time duration in seconds to a human-readable string.
 * @param seconds The time duration in seconds
 * @returns The formatted time string
 */
export function formatTime(seconds: number, [hStr, mStr, sStr] = ["hours", "minutes", "seconds"]) {
    seconds = Math.max(0, Math.floor(seconds));

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0)
        return `${h} ${hStr}`;
    else if (m > 0)
        return `${m} ${mStr}`;
    else
        return `${s} ${sStr}`;
}

/**
 * Notifies the main process to initiate a new file stream
 * @param location The location where to save the file
 * @returns A promise containing the success state of the operation
 */
export function createFileStream(location: string): Promise<boolean> {
    return ipcRenderer.invoke("CreateFileStrem", location);
}

/**
 * Writes a chunk to the current file stream
 * @param chunk The chunk to be written
 */
export function writeChunk(chunk: ArrayBuffer) {
    ipcRenderer.send("WriteChunk", chunk);
}

/**
 * Closes the current file stream
 */
export function closeFileStream() {
    ipcRenderer.send("CloseFileStream");
}

/**
 * Shows the file or folder in the system file explorer
 * @param path The path to the file or folder
 */
export function showItemInFolder(path: string) {
    ipcRenderer.send("ShowItemInFolder", path);
}

/**
 * Saves the user credentials for future logins
 * @param accessToken The user access token
 * @param refreshToken The user refresh token
 * @param expiresOn The expiration time of the token
 */
export function saveCredentials(accessToken: string, refreshToken: string, expiresOn: number) {
    ipcRenderer.send("SaveCredentials", accessToken, refreshToken, expiresOn);
}

/**
 * Logs the user out
 */
export function logout() {
    ipcRenderer.send("Logout");
}

/**
 * Sends a login request to authenticate the user on the main window
 * @returns A boolean if the authentication on the main window was successful
 */
export async function sendLoginRequest() {
    ipcRenderer.send("LoginRequest");
    return new Promise(resolve => ipcRenderer.once("LoginRequestFulfilled", (_, result: boolean) => resolve(result)));
}

/**
 * Decodes a JWT token
 * @param token The JWT token to decode
 * @returns The decoded JWT payload
 */
export async function decodeJWT(token: string): Promise<JwtPayload | null> {
    return await ipcRenderer.invoke("DecodeJWT", token);
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

ipcRenderer.on("LoginRequest", () => {
    dispatch("login");
    wLogin = true;
    addEventListener("loginFulfilled", s => ipcRenderer.send("LoginRequestFulfilled", s));
});

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
    formatTime,
    createFileStream,
    writeChunk,
    closeFileStream,
    showItemInFolder,
    saveCredentials,
    logout,
    sendLoginRequest,
    decodeJWT,
    sleep
});