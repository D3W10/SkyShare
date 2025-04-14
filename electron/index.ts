import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from "electron";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import Store from "electron-store";
import { autoUpdater } from "electron-updater";
import { Logger } from "./lib/Logger";
import { collection, db, doc, getDoc, onSnapshot, type Unsubscribe } from "./lib/firebase.js";
import type { IStore } from "./lib/interfaces/Store.interface";

require("electron-reload")(__dirname);

let window: BrowserWindow, splash: BrowserWindow, closeLock = true, serverData = {};
let iceUnsubscribe: Unsubscribe | undefined;
const winWidth = 1000, winHeight = 600;
const isDev = !app.isPackaged, isDebug = isDev || process.env.DEBUG != undefined && process.env.DEBUG.match(/true/gi) != null || process.argv.includes("-debug");
const packageData = JSON.parse(fs.readFileSync(path.join(__dirname, "/../package.json"), "utf8"));
const logger = new Logger("Main", "blue"), pLogger = new Logger("Prld", "cyan"), rLogger = new Logger("Rndr", "green");

const appConfig = new Store<IStore>({
    defaults: {
        changelog: null,
        settings: {
            theme: "light",
            language: "en-US",
            nearbyShare: true,
            autoUpdate: true,
            betaUpdates: false
        },
        account: {
            username: null,
            password: null
        }
    },
    encryptionKey: "SkyShare"
});

logger.log(`Starting ${packageData.productName} ${packageData.version} on ${process.platform == "win32" ? "Windows" : "macOS"} ${os.release()}`);
logger.log(`Running on Electron ${process.versions.electron} and NodeJS ${process.versions.node}`);
autoUpdater.logger = logger;
autoUpdater.disableWebInstaller = true;
autoUpdater.channel = !appConfig.get("settings.betaUpdates") ? "stable" : "beta";

if (isDev)
    logger.log("%cDevelopment mode enabled", "magenta");
else if (isDebug)
    logger.log("%cDebug mode enabled", "cyan");

async function createWindow() {
    window = new BrowserWindow({
        title: packageData.productName,
        width: winWidth,
        height: winHeight,
        frame: false,
        resizable: false,
        fullscreen: false,
        fullscreenable: false,
        maximizable: false,
        show: false,
        icon: !isDev ? path.join(__dirname, "./dist/www/logo.png") : path.join(__dirname, "../svelte/static/logo.png"),
        titleBarStyle: "hiddenInset",
        trafficLightPosition: { x: 12, y: 12 },
        webPreferences: {
            devTools: isDebug,
            preload: path.join(__dirname, "preload.js")
        }
    });

    window.loadURL(!isDev ? `file:///${path.join(__dirname, "www", "index.html")}` : "http://localhost:5173/");
    window.once("ready-to-show", () => splash.webContents.send("WindowReady"));
    if (process.platform == "darwin") {
        window.on("close", e => {
            if (closeLock) {
                e.preventDefault();
                window.webContents.send("WindowClose");
            }
        });
    }

    window.webContents.setWindowOpenHandler(({ url }) => {
        try {
            let { protocol } = new URL(url);

            if (protocol == "http:" || protocol == "https:") {
                logger.log(`Opening ${url}`);
                shell.openExternal(url);
                return { action: "deny" };
            }
            else
                return { action: "allow" };
        }
        catch {
            return { action: "deny" };
        }
    });

    splash = new BrowserWindow({
        title: packageData.productName,
        width: 450,
        height: 300,
        frame: false,
        resizable: false,
        fullscreen: false,
        fullscreenable: false,
        maximizable: false,
        show: false,
        icon: !isDev ? path.join(__dirname, "./dist/www/logo.png") : path.join(__dirname, "../svelte/static/logo.png"),
        webPreferences: {
            devTools: isDebug,
            preload: path.join(__dirname, "preload.js")
        }
    });

    splash.loadURL(!isDev ? `file:///${path.join(__dirname, "www", "splash.html")}` : "http://localhost:5173/splash/");
    splash.once("ready-to-show", () => splash.show());
}

if (!app.requestSingleInstanceLock())
    app.quit();

app.on("second-instance", (_, argv) => {
    logger.log("New instance opened");
    uriHandler(argv);
});

app.whenReady().then(() => {
    createWindow();

    protocol.handle("app", req => net.fetch("file://" + req.url.slice("app://".length)));
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        app.quit();
});

if (process.defaultApp) {
    if (process.argv.length >= 2)
        app.setAsDefaultProtocolClient("skyshare", process.execPath, [path.resolve(process.argv[1])]);
}
else
    app.setAsDefaultProtocolClient("skyshare");

function uriHandler(argv: string[]) {
    let uriArg = argv.find(arg => arg.startsWith("skyshare://"));
    if (!uriArg)
        return;

    const args = uriArg.slice("skyshare://".length).split("/");
    
    logger.log("Handling arguments");
    logger.log(`Arguments: [${args}]`);

    if (window.isMinimized())
        window.restore();

    window.focus();
    window.webContents.send("UriHandler", args.filter(e => e));
}

ipcMain.on("LoginRequest", (_, username: string, password: string) => window.webContents.send("LoginRequest", username, password));

ipcMain.on("LoginRequestFulfilled", (_, result: boolean) => splash.webContents.send("LoginRequestFulfilled", result));

//#region Updater

autoUpdater.on("download-progress", info => (!splash.isDestroyed() ? splash : window).webContents.send("CFUProgress", info.percent));

autoUpdater.on("update-downloaded", () => autoUpdater.quitAndInstall());

//#endregion

//#region Preload Events

ipcMain.on("LoggerPreload", (_, type: "info" | "warn" | "error", msg: string) => log(pLogger, type, msg));

ipcMain.on("LoggerRenderer", (_, type: "info" | "warn" | "error", msg: string) => log(rLogger, type, msg));

function log(logger: Logger, type: "info" | "warn" | "error", msg: string) {
    if (type == "info")
        logger.log(msg);
    else if (type == "warn")
        logger.warn(msg);
    else if (type == "error")
        logger.error(msg);
}

ipcMain.on("StoreServers", (_, servers) => serverData = servers);

ipcMain.on("GetServers", e => e.returnValue = serverData);

ipcMain.on("CheckForUpdates", () => {
    autoUpdater.checkForUpdates();

    const win = !splash.isDestroyed() ? splash : window;

    if (isDev)
        win.webContents.send("CFUStatus", false, {});
    
    autoUpdater.once("update-available", e => {
        appConfig.set("changelog", e.releaseNotes);
        win.webContents.send("CFUStatus", true, { version: e.version, date: e.releaseDate });
    });
    autoUpdater.once("update-not-available", () => win.webContents.send("CFUStatus", false, {}));
    autoUpdater.once("update-cancelled", () => win.webContents.send("CFUStatus", false, {}));
    autoUpdater.once("error", error => {
        logger.error(error.message);
        win.webContents.send("CFUStatus", false, {});
    });
});

ipcMain.on("CloseWindow", () => {
    const focus = BrowserWindow.getFocusedWindow();

    if (focus) {
        closeLock = false;
        focus.close();
    }
});

ipcMain.on("MinimizeWindow", () => {
    const focus = BrowserWindow.getFocusedWindow();

    if (focus)
        focus.minimize();
});

ipcMain.on("ResizeWindow", (_, width, height) => BrowserWindow.getAllWindows()[0].setBounds({ width: width != -1 ? width : winWidth, height: height != -1 ? height : winHeight }));

ipcMain.on("OpenMain", () => {
    splash.close();
    window.show();
    window.webContents.send("WindowOpen");
});

ipcMain.on("GetSetting", (event, key: string) => event.returnValue = appConfig.get(key));

ipcMain.on("SetSetting", (_event, key: string, value: any) => appConfig.set(key, value));

ipcMain.on("ResetSettings", () => appConfig.reset("settings"));

ipcMain.on("GetAppInfo", e => {
    e.returnValue = {
        name: packageData.productName,
        version: packageData.version,
        homepage: packageData.homepage,
        api: !isDev ? "https://skyshare.vercel.app/api/v1/" : "http://localhost:5174/api/v1/"
    }
});

ipcMain.on("GetPlatform", e => e.returnValue = process.platform);

ipcMain.handle("GetFileIcon", async (_, path: string) => (await app.getFileIcon(path, { size: "normal" })).toPNG().toString("base64"));

ipcMain.handle("IsDirectory", (_, path: string) => fs.lstatSync(path).isDirectory());

ipcMain.on("WaitForAnswer", async (_, code: string) => {
    const docRef = doc(db, "channels", code);

    if (!(await getDoc(docRef)).exists())
        return;

    const unsubscribe = onSnapshot(docRef, snapshot => {
        const data = snapshot.data();

        if (data && data.answer) {
            window.webContents.send("WaitForAnswerFulfilled", data);
            unsubscribe();
        }
    });
});

ipcMain.handle("CheckTransfer", async (_, code: string) => {
    const transferDoc = await getDoc(doc(db, "channels", code));

    return transferDoc.exists() ? transferDoc.data() : null;
});

ipcMain.on("ListenForIce", (_, code: string) => {
    const iceCandidatesCol = collection(db, `channels/${code}/iceCandidates`);

    iceUnsubscribe = onSnapshot(iceCandidatesCol, snapshot => {
        snapshot.docChanges().forEach(async change => {
            if (change.type === "added") {
                const data = change.doc.data().candidate;

                logger.log(`ICE candidate received: ${JSON.stringify(data)}`);
                window.webContents.send("IceReceived", data);
            }
        });
    });
});

ipcMain.on("StopListeningForIce", () => iceUnsubscribe!());

ipcMain.on("EncodePassword", (e, password: string) => e.returnValue = crypto.createHash("sha512").update(password).digest("hex"));

ipcMain.handle("GetFileAsBase64", async (_, file: string) => ({ data: fs.readFileSync(file).toString("base64"), type: (await ((new Function("return import(\"mime\")")) as () => Promise<typeof import("mime")>)()).default.getType(file) }));

ipcMain.handle("ShowOpenDialog", async (_, options: Electron.OpenDialogOptions) => {
    let dialogResult = await dialog.showOpenDialog(BrowserWindow.getAllWindows()[0], options);

    return {
        canceled: dialogResult.canceled,
        files: dialogResult.filePaths.map(path => {
            return {
                name: path.replace(/.*[\/\\]/, ""),
                path: path,
                size: fs.statSync(path).size
            };
        })
    };
});

ipcMain.handle("ShowSaveDialog", async (_, options: Electron.SaveDialogOptions) => await dialog.showSaveDialog(BrowserWindow.getAllWindows()[0], options));

//#endregion