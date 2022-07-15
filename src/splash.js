const { ipcRenderer } = require("electron");
const fs = require("fs");
const log = require("electron-log");
const isOnline = require("is-online");
const utils = require("./utils");

Object.assign(console, log.functions);
log.transports.file.fileName = "logs.log";

window.addEventListener("load", async () => {
    document.querySelector("#splash > div > div > h1").innerText = utils.package.productName;
    
    let appearanceMode = !(await utils.getSetting("settings")).darkMode;
    document.body.setAttribute("theme", appearanceMode ? "light" : "dark");

    if (!await isOnline({ timeout: 3000 })) {
        console.error("Sem conexão há internet.");
        document.getElementById("splashMessage").innerText = "Sem conexão à internet";
        return;
    }
    
    document.getElementById("splashMessage").innerText = "A procurar por atualizações";
    ipcRenderer.send("CheckForUpdates", utils.package.version);

    ipcRenderer.on("CheckForUpdatesComplete", async (_event, status, url) => {
        if (!status || !(await utils.getSetting("settings.autoUpdate"))) {
            document.getElementById("splashMessage").innerText = "A iniciar sessão";
            let loginSuccess = await utils.accountManager(utils.accountMode.LOGINSTART);
            if (!loginSuccess)
                utils.showErrorDialog("Falha ao conectar", "Não foi possível conectar ao servidor e iniciar sessão.");

            document.getElementById("splashMessage").innerText = "A finalizar!";
            if (fs.existsSync((await utils.getPaths("temp")) + "\\" + utils.package.productName + ".exe"))
                fs.unlinkSync((await utils.getPaths("temp")) + "\\" + utils.package.productName + ".exe");

            utils.openMain();
        }
        else {
            document.getElementById("splashMessage").innerText = "A atualizar";
            ipcRenderer.send("InstallUpdate", url);
        }
    });
});