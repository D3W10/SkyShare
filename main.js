const { app, BrowserWindow, dialog, globalShortcut, ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const os = require("os");
const log = require("electron-log");
const Store = require("electron-store");
const axios = require("axios").default;
const FormData = require("form-data");
const progress = require("progress-stream");
const package = require("./package.json");
var splash, win, loadStage = 0, account = {};

//#region Initialization

Object.assign(console, log.functions);
log.transports.file.fileName = "logs.log";
log.transports.file.getFile().clear();
console.log("Iniciando o " + package.productName + " " + package.version + " no Windows " + os.release());
console.log("Executando no Electron " + process.versions.electron + " e NodeJS " + process.versions.node);

const appConfig = new Store({ defaults: {
    lastRunVersion: app.getVersion(),
    settings: {
        darkMode: false,
        saveHistory: true,
        autoUpdate: true,
        betaUpdates: false
    }
}});

//#endregion

//#region App Windows

function createWindow() {
    splash = new BrowserWindow({
        title: package.productName,
        width: 450,
        height: 300,
        frame: false,
        resizable: false,
        fullscreen: false,
        fullscreenable: false,
        maximizable: false,
        show: false,
        icon: path.join(__dirname, "assets/logo.png"),
        sandbox: true,
        webPreferences: {
            devTools: process.env.DEBUG,
            preload: path.join(__dirname, "src/splash.js")
        }
    });
    splash.loadFile("splash.html");
    splash.once("ready-to-show", () => splash.show());

    win = new BrowserWindow({
        title: package.productName,
        width: 1000,
        height: 600,
        frame: false,
        resizable: false,
        fullscreen: false,
        fullscreenable: false,
        maximizable: false,
        show: false,
        icon: path.join(__dirname, "assets/logo.png"),
        sandbox: true,
        webPreferences: {
            devTools: process.env.DEBUG,
            preload: path.join(__dirname, "src/home.js")
        }
    });
}

//#endregion

//#region App Events

if (!app.requestSingleInstanceLock())
    app.quit();

app.on("second-instance", () => {
    if (win.isMinimized())
        win.restore();
    win.focus();
});

app.whenReady().then(() => {
    createWindow();
    
    globalShortcut.register("CommandOrControl+Shift+I", () => {
        return false;
    });
    
    globalShortcut.register("CommandOrControl+F12", () => {
        if (BrowserWindow.getFocusedWindow())
            BrowserWindow.getFocusedWindow().webContents.openDevTools();
    });
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

//#endregion

//#region Render Events

ipcMain.on("WinClose", () => app.exit());

ipcMain.on("WinMinimize", () => BrowserWindow.getAllWindows()[0].minimize());

ipcMain.on("OpenMain", () => {
    loadStage++;

    if (loadStage == 1)
        win.loadFile("index.html");
    else if (loadStage == 2)
        win.webContents.send("ReloadAccount");
    else if (loadStage == 3) {
        splash.close();
        win.show();
        if (process.env.DEBUG)
            win.webContents.openDevTools();
    }
});

ipcMain.on("GetPaths", (event, name) => event.returnValue = app.getPath(name));

ipcMain.on("GetUrlPath", (event) => event.returnValue = process.argv.length >= 3 ? process.argv[2].replace("skyshare://", "") : (process.argv.length >= 2 ? process.argv[1].replace("skyshare://", "") : ""));

ipcMain.on("GetSetting", (event, name) => event.returnValue = appConfig.get(name));

ipcMain.on("SetSetting", (_event, name, value) => appConfig.set(name, value));

ipcMain.on("SetProgressBar", (_event, pgss) => setProgressBar(pgss));

function setProgressBar(pgss) {
    win.setProgressBar(pgss / 100);
}

ipcMain.on("CheckForUpdates", async (_event, version) => {
    try {
        let ghList, ghInfo;

        ghList = await axios.get(package.releases + "releases");
        for (const release of ghList.data) {
            if (release.prerelease && appConfig.get("settings.betaUpdates")) {
                ghInfo = release;
                break;
            }
            else if (!release.prerelease) {
                ghInfo = release;
                break;
            }
        }
        
        if (version == ghInfo.tag_name)
            splash.webContents.send("CheckForUpdatesComplete", false);
        else
            splash.webContents.send("CheckForUpdatesComplete", true, ghInfo.assets[1].browser_download_url);
    }
    catch (err) {
        console.error("There was an error while checking for updates: " + err);
        splash.webContents.send("CheckForUpdatesComplete", false);
    }
});

ipcMain.on("InstallUpdate", async (_event, url) => {
    let writer = fs.createWriteStream(app.getPath("temp") + "\\" + package.productName + ".exe");
    let ghFile = await axios.get(url, {
        responseType: "stream"
    });

    ghFile.data.pipe(writer);
    writer.on("close", async () => {
        await shell.openPath(app.getPath("temp") + "\\" + package.productName + ".exe");
        app.exit();
    });
});

ipcMain.on("GetChanges", async (event) => {
    let ghChanges = await axios.get(package.releases + "releases/tags/" + package.version);
    event.returnValue = ghChanges.data.body;
});

ipcMain.on("AccountStorage", async (event, store, acc) => {
    if (store) {
        delete acc.recoveryKey;
        account = acc;
    }
    else
        event.returnValue = account;
});

ipcMain.on("SendFile", async (_event, files, message) => {
    let signupFormData = new FormData();
    for (const file of files)
        signupFormData.append("file", fs.createReadStream(file.path));
    signupFormData.append("message", message);

    if (Object.keys(account).length != 0) {
        signupFormData.append("username", account.username);
        signupFormData.append("password", account.password);
        signupFormData.append("save", String(appConfig.get("settings.saveHistory", true)));
    }

    let apiResult = await axios.post(package.api + "file/upload", signupFormData, {
        headers: {
            ...signupFormData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        validateStatus: () => true
    });
    
    win.webContents.send("SendFileComplete", apiResult.data, apiResult.status);
});

ipcMain.on("ReceiveFile", async (_event, code, path) => {
    let fileStream = fs.createWriteStream(path), totalLength, bodyObj = {};

    if (Object.keys(account).length != 0) {
        bodyObj.username = account.username;
        bodyObj.password = account.password;
        bodyObj.save = String(appConfig.get("settings.saveHistory", true));
    }

    let apiResult = await axios.post(package.api + "file/" + code, bodyObj, {
        responseType: "stream",
        validateStatus: () => true
    });
    totalLength = Number(apiResult.headers["content-length"]);
    let streamProgress = progress({ length: totalLength, time: 100 });

    let filePipe = apiResult.data.pipe(streamProgress).pipe(fileStream);
    streamProgress.on("progress", (progress) => {
        win.webContents.send("ReceiveFileProgress", progress.percentage);
        setProgressBar(progress.percentage);
    });
    filePipe.on("finish", () => {
        setProgressBar(-100);
        win.webContents.send("ReceiveFileComplete");
    });
});

ipcMain.on("AccountSignUp", async (_event, args) => {
    let signupFormData = new FormData();
    signupFormData.append("username", args.username);
    signupFormData.append("email", args.email);
    signupFormData.append("password", args.password);
    if (args.picture != null)
        signupFormData.append("picture", fs.createReadStream(args.picture));

    let apiResult = await axios.post(package.api + "user/signup", signupFormData, {
        headers: {
            ...signupFormData.getHeaders()
        },
        validateStatus: () => true
    });
    
    win.webContents.send("AccountSignUpComplete", apiResult.data, apiResult.status);
});

ipcMain.on("AccountEditInfo", async (_event, args) => {
    let editInfoFormData = new FormData();
    editInfoFormData.append("password", account.password);
    if (args.newUsername != null)
        editInfoFormData.append("newUsername", args.newUsername);
    if (args.email != null)
        editInfoFormData.append("email", args.email);
    if (args.pictureChange) {
        if (args.picture.endsWith(".svg"))
            editInfoFormData.append("removePicture", "true");
        else
            editInfoFormData.append("picture", fs.createReadStream(args.picture));
    }  

    let apiResult = await axios.put(package.api + "user/" + account.username + "/edit/info", editInfoFormData, {
        headers: {
            ...editInfoFormData.getHeaders()
        },
        validateStatus: () => true
    });
    
    win.webContents.send("AccountEditInfoComplete", apiResult.data, apiResult.status);
});

ipcMain.on("ShowDialog", async (event, type, options) => {
    if (type == "OPEN")
        event.returnValue = await dialog.showOpenDialog(BrowserWindow.getAllWindows()[0], options);
    else if (type == "SAVE")
        event.returnValue = await dialog.showSaveDialog(BrowserWindow.getAllWindows()[0], options);
    else if (type == "ERROR")
        event.returnValue = dialog.showErrorBox(options.title, options.content);
});

//#endregion