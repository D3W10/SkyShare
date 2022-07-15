const fs = require("fs");
const log = require("electron-log");
const isOnline = require("is-online");
const axios = require("axios").default;
const utils = require("./utils");
const { sleep } = require("./utils");
var offlineLastOpenPanel = null, hueRotate = 0, hueRotateTimeOut = undefined, upSideDown = 0, upSideDownTimeOut = undefined;

Object.assign(console, log.functions);
log.transports.file.fileName = "logs.log";

window.addEventListener("load", () => {
    //#region Initialization

    (async function () {
        await utils.reloadIcons();

        let currentSettings = await utils.getSetting("settings");
        document.body.setAttribute("theme", !currentSettings.darkMode ? "light" : "dark");

        for (const panel of document.getElementById("appTab").children) {
            if (panel.id != utils.openPanel() && panel.id != "loadBar") {
                panel.style.opacity = "0";
                panel.style.display = "none";
            }
        }

        for (const element of document.querySelectorAll("[goto]")) {
            element.addEventListener("click", async (event) => {
                let panelToSwitch = event.currentTarget.getAttribute("goto");

                if (!event.currentTarget.hasAttribute("disabled") && !event.currentTarget.parentElement.hasAttribute("disabled")) {
                    if (utils.openPanel() == panelToSwitch && window.getComputedStyle(document.getElementById(panelToSwitch).children[0]).opacity == "1")
                        return;
                    utils.switchPanels(panelToSwitch);
                }
            });
        }

        document.getElementById("frameName").innerText = utils.package.productName;
        document.getElementById("homeAppName").innerText = utils.package.productName;
        document.getElementById("settingsName").innerText = utils.package.productName;
        document.getElementById("settingsVersion").innerText = utils.package.version;

        document.getElementById("settingsAppearance").value = !currentSettings.darkMode ? "0" : "1";
        document.getElementById("settingsSaveHistory").checked = currentSettings.saveHistory;
        document.getElementById("settingsAutoUpdate").checked = currentSettings.autoUpdate;
        document.getElementById("settingsBetaUpdates").checked = currentSettings.betaUpdates;

        setTimeout(async () => {
            if (utils.package.version != (await utils.getSetting("lastRunVersion"))) {
                utils.showPopUp("changelogPopup", "O que há de novo na " + utils.package.version, null, await utils.getChanges());
                utils.setSetting("lastRunVersion", utils.package.version);
            }
        }, 500);
        setInterval(async () => {
            if (!await isOnline({ timeout: 3000 })) {
                if (utils.openPanel() != "offlinePanel") {
                    offlineLastOpenPanel = utils.openPanel();
                    utils.switchPanels("offlinePanel");
                    document.getElementById("sidebar").setAttribute("disabled", "");
                }
            }
            else {
                if (utils.openPanel() == "offlinePanel") {
                    utils.switchPanels(offlineLastOpenPanel);
                    document.getElementById("sidebar").removeAttribute("disabled");
                }
            }
        }, 2000);
        setInterval(utils.updateGreeting, 3600000);

        utils.openMain();

        let urlSchemePath = await utils.getUrlPath();
        if (urlSchemePath && urlSchemePath.match(/^receive\/\d{6}$/g)) {
            let code = urlSchemePath.match(/(?<=receive\/)\d{6}$/g)[0];

            document.getElementById("code1").value = code[0];
            document.getElementById("code2").value = code[1];
            document.getElementById("code3").value = code[2];
            document.getElementById("code4").value = code[3];
            document.getElementById("code5").value = code[4];
            document.getElementById("code6").value = code[5];

            await utils.switchPanels("receivePanel");
            document.getElementById("filesReceive").disabled = false;
            document.getElementById("filesReceive").click();
        }
    }());

    //#endregion

    //#region Frame Bar

    document.querySelector("#frameBar > div:first-child > img").addEventListener("click", () => {
        hueRotate++;
        clearTimeout(hueRotateTimeOut);
        hueRotateTimeOut = setTimeout(() => hueRotate = 0, 400);
        if (hueRotate == 5) {
            hueRotate = 0;
            if (!document.body.hasAttribute("style"))
                document.body.style.animation = "hueRotate 5s infinite linear";
            else
                document.body.removeAttribute("style");
        }
    });

    document.getElementById("closeCircle").addEventListener("click", () => utils.closeWindow());

    document.getElementById("minimizeCircle").addEventListener("click", () => utils.minimizeWindow());

    //#endregion

    //#region Send Panel

    var selectedFiles = new Array(), byteUnits = ["Bytes", "KB", "MB", "GB"], treeCounter = 0;

    document.getElementById("filesEmpty").addEventListener("click", () => selectFiles(utils.selectMode.CLICK));
    document.getElementById("addFiles").addEventListener("click", () => selectFiles(utils.selectMode.CLICK));

    document.getElementById("filesSpace").ondragenter = () => dragAndDrop(utils.dragMode.ENTER);
    document.getElementById("filesSpace").ondragleave = () => dragAndDrop(utils.dragMode.LEAVE);
    document.getElementById("filesSpace").ondragover = (event) => event.preventDefault();
    document.getElementById("filesSpace").ondrop = (event) => dragAndDrop(utils.dragMode.DROP, event);

    async function dragAndDrop(mode, event) {
        if (!document.getElementById("filesSpace").hasAttribute("disabled")) {
            if (mode == utils.dragMode.ENTER) {
                treeCounter++;
                if (treeCounter == 1) {
                    document.querySelector("#filesEmpty > p").innerText = "Preparado para enviar!";
                    document.querySelector("#filesEmpty > span").innerText = "Largue-o e eu trato do resto!";
                    document.getElementById("filesSpace").style.borderColor = "var(--focusColor)";
                }
            }
            else if (mode == utils.dragMode.LEAVE) {
                treeCounter--;
                if (treeCounter == 0) {
                    document.querySelector("#filesEmpty > p").innerText = "Escolher ficheiros";
                    document.querySelector("#filesEmpty > span").innerText = "Ou arraste para aqui!";
                    document.getElementById("filesSpace").removeAttribute("style");
                }
            }
            else if (mode == utils.dragMode.DROP) {
                treeCounter = 0;
                document.querySelector("#filesEmpty > p").innerText = "Escolher ficheiros";
                document.querySelector("#filesEmpty > span").innerText = "Ou arraste para aqui!";
                document.getElementById("filesSpace").removeAttribute("style");
                selectFiles(utils.selectMode.DROP, event);
            }
        }
    }

    async function selectFiles(mode, event) {
        if (!document.getElementById("filesSpace").hasAttribute("disabled")) {
            let selectedFilesRollback = [...selectedFiles], totalFileSize = 0, importError = false;

            if (mode == utils.selectMode.CLICK) {
                let filesDialog = await utils.showOpenDialog("Escolher ficheiros", [{ name: "Todos os ficheiros", extensions: ["*"] }], ["openFile", "multiSelections"]);
                if (filesDialog.canceled)
                    return;
                
                for (const path of filesDialog.filePaths) {
                    let fileRejected = false;

                    for (const selectedFile of selectedFiles) {
                        if (path.replace(/.*[\/\\]/, "") == selectedFile.name) {
                            importError = true;
                            fileRejected = true;
                        }
                    }
                    if (fileRejected)
                        continue;

                    let obj = {
                        name: path.replace(/.*[\/\\]/, ""),
                        path: path,
                        size: fs.statSync(path).size
                    }
                    selectedFiles.push(obj);
                }
            }
            else if (mode == utils.selectMode.DROP) {
                for (const file of event.dataTransfer.files) {
                    let fileRejected = false;

                    if (!utils.checkFolder(file.path)) {
                        for (const selectedFile of selectedFiles) {
                            if (file.name == selectedFile.name) {
                                importError = true;
                                fileRejected = true;
                            }
                        }
                        if (fileRejected)
                            continue;

                        let obj = {
                            name: file.name,
                            path: file.path,
                            size: fs.statSync(file.path).size
                        }
                        selectedFiles.push(obj);
                    }
                }
            }

            for (const file of selectedFiles)
                totalFileSize += file.size;

            if (selectedFiles.length > 50) {
                selectedFiles = [...selectedFilesRollback];
                utils.apiErrorHandler(24);
                return;
            }
            else if (totalFileSize >= 1073741824) {
                selectedFiles = [...selectedFilesRollback];
                utils.apiErrorHandler(25);
                return;
            }

            if (importError)
                utils.showPopUp("alertPopup", "Aviso", "Um ou mais dos ficheiros selecionados não puderam ser adicionados, dado que já foram inseridos ficheiros com o mesmo nome.");

            reloadFiles();
        }
    }

    async function reloadFiles() {
        let totalFileSize = 0, index = 0;;
        document.getElementById("filesContent").replaceChildren();
        document.getElementById("filesNumber").innerText = selectedFiles.length + " ficheiro" + (selectedFiles.length != 1 ? "s" : "");

        if (selectedFiles.length != 0) {
            document.getElementById("filesEmpty").style.display = "none";
            document.getElementById("filesEmpty").style.opacity = "0";
            document.getElementById("filesList").style.display = "flex";
            document.getElementById("filesList").style.opacity = "1";
            document.getElementById("filesSend").disabled = false;

            for (const file of selectedFiles) {
                let fileSizeToFormat = 0, rCount = 0;
                let fileDiv = document.createElement("div");
                let infoDiv = document.createElement("div");
                let fileName = document.createElement("span");
                let fileSize = document.createElement("span");
                let removeIcon = document.createElement("icon");

                fileName.innerText = file.name;
                fileName.title = file.name;

                fileSizeToFormat = file.size;
                totalFileSize += file.size;
                do {
                    fileSizeToFormat /= 1024;
                    rCount++;
                }
                while (fileSizeToFormat > 1024);
                fileSize.innerText = fileSizeToFormat.toFixed(2) + " " + byteUnits[rCount];

                removeIcon.setAttribute("name", "close");

                infoDiv.appendChild(fileName);
                infoDiv.appendChild(fileSize);
                fileDiv.appendChild(infoDiv);
                fileDiv.appendChild(removeIcon);
                document.getElementById("filesContent").appendChild(fileDiv);

                removeIcon.addEventListener("click", async (event) => {
                    if (!document.getElementById("filesSpace").hasAttribute("disabled")) {
                        let parent = event.currentTarget.parentElement;
                        for (const file of selectedFiles) {
                            if (file.name == parent.querySelector("div > span").title)
                                selectedFiles.splice(selectedFiles.indexOf(file), 1);
                        }
    
                        parent.style.opacity = 0;
                        await sleep(200);
                        parent.style.height = 0;
                        parent.style.marginBottom = 0;
                        parent.style.padding = 0;
                        await sleep(200);
                        reloadFiles();
                    }
                });
            }
            utils.reloadIcons();
        }
        else {
            document.getElementById("filesSend").disabled = true;

            document.getElementById("filesList").style.opacity = "0";
            await sleep(400);
            document.getElementById("filesList").removeAttribute("style");
            document.getElementById("filesEmpty").style.display = "flex";
            await sleep(50);
            document.getElementById("filesEmpty").removeAttribute("style");
        }

        do {
            totalFileSize /= 1024;
            index++;
        }
        while (totalFileSize > 1024);
        document.getElementById("filesSize").innerText = totalFileSize.toFixed(2) + " " + byteUnits[index];
    }

    document.getElementById("sendMessage").addEventListener("keypress", enterSendButton);

    function enterSendButton(event) {
        if (event.key == "Enter")
            document.getElementById("filesSend").click();
    }

    document.getElementById("filesSend").addEventListener("click", async () => {
        for (const selectedFile of selectedFiles) {
            if (!fs.existsSync(selectedFile.path)) {
                utils.showPopUp("alertPopup", "Erro ao enviar", "Um ou mais ficheiros a enviar já não existem. Verifique se os mesmos ainda estão na mesma pasta e tente novamente.");
                return;
            }
        }

        document.getElementById("sidebar").setAttribute("disabled", "");
        document.getElementById("loadBar").style.display = "block";
        document.getElementById("filesSpace").setAttribute("disabled", "");
        document.getElementById("sendMessage").disabled = true;
        document.getElementById("filesSend").disabled = true;

        let tData = await utils.sendFile(selectedFiles, document.getElementById("sendMessage").value);
        if (typeof tData == "boolean") {
            utils.showPopUp("alertPopup", "Erro ao enviar", "Ocorreu um erro durante o envio dos ficheiros. Por favor tente novamente mais tarde.");

            selectedFiles = new Array();
            document.getElementById("sidebar").removeAttribute("disabled");
            document.getElementById("filesSpace").removeAttribute("disabled");
            document.getElementById("sendMessage").disabled = false;
            document.getElementById("sendMessage").value = "";
            document.getElementById("uploadEta").innerText = "0 segundos";
            document.getElementById("uploadSpeed").innerText = "0.00 MB/s";
            document.querySelector("#uploadProgress > svg").style.removeProperty("--value");
            document.querySelector("#uploadProgress > p").innerText = "0";
            reloadFiles();

            utils.switchSubpanels(document.getElementById("filesUploading"), document.getElementById("filesPrepare"));
            return;
        }

        tData.creation = new Date(tData.creation);
        tData.expire = new Date(tData.expire);
        document.getElementById("transferCode").innerText = tData.code;
        document.getElementById("transferCreation").innerText = tData.creation.toLocaleDateString();
        document.getElementById("transferExpire").innerText = tData.expire.toLocaleDateString();
        await utils.switchSubpanels(document.getElementById("filesUploading"), document.getElementById("filesDone"));

        selectedFiles = new Array();
        document.getElementById("sidebar").removeAttribute("disabled");
        document.getElementById("filesSpace").removeAttribute("disabled");
        document.getElementById("sendMessage").disabled = false;
        document.getElementById("sendMessage").value = "";
        document.getElementById("uploadEta").innerText = "0 segundos";
        document.getElementById("uploadSpeed").innerText = "0.00 MB/s";
        document.querySelector("#uploadProgress > svg").style.removeProperty("--value");
        document.querySelector("#uploadProgress > p").innerText = "0";
        reloadFiles();
    });

    document.getElementById("doneCopy").addEventListener("click", async (event) => {
        if (!event.currentTarget.parentElement.hasAttribute("disabled")) {
            let entry = event.currentTarget, entryDiv = event.currentTarget.parentElement;
            entryDiv.setAttribute("disabled", "");

            utils.copyToClipboard(document.getElementById("transferCode").innerText);
            entry.style.fill = "var(--accent)";
            await sleep(1200);
            entry.removeAttribute("style");

            entryDiv.removeAttribute("disabled");
        }
    });

    document.getElementById("doneCopyLink").addEventListener("click", async (event) => {
        if (!event.currentTarget.parentElement.hasAttribute("disabled")) {
            let entry = event.currentTarget, entryDiv = event.currentTarget.parentElement;
            entryDiv.setAttribute("disabled", "");

            utils.copyToClipboard(utils.package.url + "?dl=" + document.getElementById("transferCode").innerText);
            entry.style.fill = "var(--accent)";
            await sleep(1200);
            entry.removeAttribute("style");

            entryDiv.removeAttribute("disabled");
        }
    });

    //#endregion

    //#region Receive Panel

    for (let i = 1; i <= 6; i++) {
        document.getElementById("code" + i).addEventListener("keydown", (event) => {
            if ((event.ctrlKey && event.key == "v") || /[0-9]/.test(event.key))
                return;
            if (!/[0-9]/.test(event.key) && event.key != "Backspace" && event.key != "Delete")
                event.preventDefault();
            if (event.key == "Backspace") {
                if (document.getElementById("code" + i).value.length == 0 && i != 1)
                    document.getElementById("code" + (i - 1)).focus();
            }
            else if (event.key == "Enter")
                document.getElementById("filesReceive").click();
            else if (event.key == "ArrowRight" && i != 6)
                document.getElementById("code" + (i + 1)).focus();
            else if (event.key == "ArrowLeft" && i != 1)
                document.getElementById("code" + (i - 1)).focus();
        });

        document.getElementById("code" + i).addEventListener("keypress", async (event) => {
            if (!Object.is(Number(event.key), NaN) && i != 6) {
                await sleep(10);
                document.getElementById("code" + (i + 1)).focus();
            }
        });

        document.getElementById("code" + i).addEventListener("input", () => {
            if (Object.is(Number(document.getElementById("code" + i).value), NaN))
                document.getElementById("code" + i).value = "";

            if (document.getElementById("code1").value.length != 0 && document.getElementById("code2").value.length != 0 && document.getElementById("code3").value.length != 0 && document.getElementById("code4").value.length != 0 && document.getElementById("code5").value.length != 0 && document.getElementById("code6").value.length != 0)
                document.getElementById("filesReceive").disabled = false;
            else
                document.getElementById("filesReceive").disabled = true;
        });

        document.getElementById("code" + i).addEventListener("paste", (event) => {
            let clipboardCode = event.clipboardData.getData("text");

            event.preventDefault();
            if (/^\d{6}$/.test(clipboardCode)) {
                document.getElementById("code1").value = clipboardCode[0];
                document.getElementById("code2").value = clipboardCode[1];
                document.getElementById("code3").value = clipboardCode[2];
                document.getElementById("code4").value = clipboardCode[3];
                document.getElementById("code5").value = clipboardCode[4];
                document.getElementById("code6").value = clipboardCode[5];
                document.getElementById("filesReceive").disabled = false;
            }
        });
    }

    document.getElementById("filesReceive").addEventListener("click", async () => {
        document.getElementById("filesReceive").disabled = true;
        document.getElementById("sidebar").setAttribute("disabled", "");
        for (let i = 1; i <= 6; i++)
            document.getElementById("code" + i).disabled = true;
        document.getElementById("loadBar").style.display = "block";
        document.getElementById("receiveInfo").setAttribute("disabled", "");

        let receiveSuccess = await utils.receiveFile(document.getElementById("code1").value + document.getElementById("code2").value + document.getElementById("code3").value + document.getElementById("code4").value + document.getElementById("code5").value + document.getElementById("code6").value);

        document.getElementById("sidebar").removeAttribute("disabled");
        for (let i = 1; i <= 6; i++)
            document.getElementById("code" + i).disabled = false;
        document.getElementById("loadBar").style.display = "none";
        if (receiveSuccess) {
            document.getElementById("code1").value = "";
            document.getElementById("code2").value = "";
            document.getElementById("code3").value = "";
            document.getElementById("code4").value = "";
            document.getElementById("code5").value = "";
            document.getElementById("code6").value = "";
        }
        else
            document.getElementById("filesReceive").disabled = false;
    });

    async function transferMessageResize() {
        document.getElementById("transferMessage").removeAttribute("style");

        if (document.getElementById("transferMessage").offsetWidth > 204) {
            document.querySelector("#transferMessageSafe > style").innerText = "@keyframes textSlide { 0% { left: 204px; } 100% { left: -" + document.getElementById("transferMessage").offsetWidth + "px; } }";
            document.getElementById("transferMessage").style.animation = "textSlide " + (document.getElementById("transferMessage").innerText.length * 0.1) + "s linear 0s infinite";
            document.getElementById("transferMessageSafe").classList.add("moving");
        }
        else
            document.getElementById("transferMessageSafe").classList.remove("moving");
    }

    new ResizeObserver(transferMessageResize).observe(document.getElementById("transferMessage"));

    //#endregion

    //#region Login Panel

    document.getElementById("loginForgot").addEventListener("click", (event) => {
        if (!event.currentTarget.hasAttribute("disabled"))
            utils.switchSubpanels(document.getElementById("accountLogin"), document.getElementById("accountForgot"));
    });

    document.getElementById("createAccount").addEventListener("click", (event) => {
        if (!event.currentTarget.hasAttribute("disabled"))
            utils.switchSubpanels(document.getElementById("accountLogin"), document.getElementById("accountSignup"));
    });

    document.getElementById("loginUsername").addEventListener("keypress", enterLoginButton);
    document.getElementById("loginPassword").addEventListener("keypress", enterLoginButton);
    document.getElementById("loginUsername").addEventListener("input", unlockLoginButton);
    document.getElementById("loginPassword").addEventListener("input", unlockLoginButton);

    function enterLoginButton(event) {
        if (event.key == "Enter")
            document.getElementById("loginButton").click();
    }

    function unlockLoginButton() {
        if (document.getElementById("loginUsername").value.length != 0 && document.getElementById("loginPassword").value.length != 0)
            document.getElementById("loginButton").disabled = false;
        else
            document.getElementById("loginButton").disabled = true;
    }

    document.getElementById("loginButton").addEventListener("click", async () => {
        document.getElementById("loginButton").disabled = true;
        document.getElementById("loadBar").style.display = "block";
        document.getElementById("sidebar").setAttribute("disabled", "");
        document.getElementById("loginUsername").disabled = true;
        document.getElementById("loginPassword").disabled = true;
        document.getElementById("loginForgot").setAttribute("disabled", "");
        document.getElementById("createAccount").setAttribute("disabled", "");

        let success = await utils.accountManager(utils.accountMode.LOGIN, {
            username: document.getElementById("loginUsername").value,
            password: document.getElementById("loginPassword").value
        });
        if (success)
            await sleep(1500);

        document.getElementById("loadBar").style.display = "none";
        document.getElementById("sidebar").removeAttribute("disabled");
        document.getElementById("loginUsername").disabled = false;
        document.getElementById("loginPassword").disabled = false;
        document.getElementById("loginForgot").removeAttribute("disabled");
        document.getElementById("createAccount").removeAttribute("disabled");

        if (success) {
            utils.switchPanels("welcomePanel");
            await utils.switchSubpanels(document.getElementById("welcomeInitial"), document.getElementById("welcomeFinal"));
            await sleep(500);
            welcomeFinalAnimation(false);
            document.getElementById("loginUsername").value = "";
            document.getElementById("loginPassword").value = "";
        }
        else
            document.getElementById("loginButton").disabled = false;
    });

    document.getElementById("forgotUsername").addEventListener("keypress", enterForgotButton);
    document.getElementById("forgotKey").addEventListener("keypress", enterForgotButton);
    document.getElementById("forgotUsername").addEventListener("input", unlockForgotButton);
    document.getElementById("forgotKey").addEventListener("input", unlockForgotButton);

    function enterForgotButton(event) {
        if (event.key == "Enter")
            document.getElementById("forgotButton").click();
    }

    function unlockForgotButton() {
        if (document.getElementById("forgotUsername").value.length != 0 && document.getElementById("forgotKey").value.length != 0)
            document.getElementById("forgotButton").disabled = false;
        else
            document.getElementById("forgotButton").disabled = true;
    }

    document.getElementById("forgotButton").addEventListener("click", async () => {
        document.getElementById("forgotButton").disabled = true;
        document.getElementById("loadBar").style.display = "block";
        document.getElementById("sidebar").setAttribute("disabled", "");
        document.getElementById("forgotUsername").disabled = true;
        document.getElementById("forgotKey").disabled = true;

        let success = await utils.accountManager(utils.accountMode.RECOVERY_CHECK, {
            username: document.getElementById("forgotUsername").value,
            recoveryKey: document.getElementById("forgotKey").value
        });

        document.getElementById("loadBar").style.display = "none";
        document.getElementById("sidebar").removeAttribute("disabled");
        document.getElementById("forgotUsername").disabled = false;
        document.getElementById("forgotKey").disabled = false;

        if (success) {
            let userPicture = await axios.get(utils.package.api + "user/" + document.getElementById("forgotUsername").value + "/picture", { validateStatus: () => true });
            if (userPicture.status == 200)
                document.getElementById("resetProfilePic").style.setProperty("--image", "url(\"" + utils.package.api + "user/" + document.getElementById("forgotUsername").value + "/picture\")");
            else
                document.getElementById("resetProfilePic").style.setProperty("--image", "url(\"./icons/account.svg\")");
            utils.switchSubpanels(document.getElementById("accountForgot"), document.getElementById("accountReset"));
        }
        else
            document.getElementById("forgotButton").disabled = false;
    });

    document.getElementById("resetPassword").addEventListener("keypress", enterResetButton);
    document.getElementById("resetPasswordRepeat").addEventListener("keypress", enterResetButton);
    document.getElementById("resetPassword").addEventListener("input", unlockResetButton);
    document.getElementById("resetPasswordRepeat").addEventListener("input", unlockResetButton);

    function enterResetButton(event) {
        if (event.key == "Enter")
            document.getElementById("resetButton").click();
    }

    function unlockResetButton() {
        if (document.getElementById("resetPassword").value.length != 0 && document.getElementById("resetPasswordRepeat").value.length != 0)
            document.getElementById("resetButton").disabled = false;
        else
            document.getElementById("resetButton").disabled = true;
    }

    document.getElementById("resetButton").addEventListener("click", async () => {
        if (document.getElementById("resetPassword").value != document.getElementById("resetPasswordRepeat").value)
            utils.showPopUp("alertPopup", "Palavra-passe Inválida", "As palavras-passe inseridas não são iguais, por favor verifique e tente novamente.");
        else {
            document.getElementById("resetButton").disabled = true;
            document.getElementById("loadBar").style.display = "block";
            document.getElementById("sidebar").setAttribute("disabled", "");
            document.getElementById("resetPassword").disabled = true;
            document.getElementById("resetPasswordRepeat").disabled = true;

            let success = await utils.accountManager(utils.accountMode.PASSWORD_RECOVERY, {
                username: document.getElementById("forgotUsername").value,
                recoveryKey: document.getElementById("forgotKey").value,
                password: document.getElementById("resetPassword").value
            });

            document.getElementById("loadBar").style.display = "none";
            document.getElementById("sidebar").removeAttribute("disabled");
            document.getElementById("resetPassword").disabled = false;
            document.getElementById("resetPasswordRepeat").disabled = false;

            if (success) {
                utils.switchPanels("homePanel");
                document.getElementById("forgotUsername").value = "";
                document.getElementById("forgotKey").value = "";
                document.getElementById("resetPassword").value = "";
                document.getElementById("resetPasswordRepeat").value = "";
            }
            else
                document.getElementById("resetButton").disabled = false;
        }
    });

    document.getElementById("signupUsername").addEventListener("keypress", enterSignupButton);
    document.getElementById("signupEmail").addEventListener("keypress", enterSignupButton);
    document.getElementById("signupPassword").addEventListener("keypress", enterSignupButton);
    document.getElementById("signupPasswordRepeat").addEventListener("keypress", enterSignupButton);
    document.getElementById("signupUsername").addEventListener("input", unlockSignupButton);
    document.getElementById("signupEmail").addEventListener("input", unlockSignupButton);
    document.getElementById("signupPassword").addEventListener("input", unlockSignupButton);
    document.getElementById("signupPasswordRepeat").addEventListener("input", unlockSignupButton);

    function enterSignupButton(event) {
        if (event.key == "Enter")
            document.getElementById("signupButton").click();
    }

    function unlockSignupButton() {
        if (document.getElementById("signupUsername").value.length != 0 && document.getElementById("signupEmail").value.length != 0 && document.getElementById("signupPassword").value.length != 0 && document.getElementById("signupPasswordRepeat").value.length != 0)
            document.getElementById("signupButton").disabled = false;
        else
            document.getElementById("signupButton").disabled = true;
    }

    document.getElementById("signupButton").addEventListener("click", async () => {
        if (document.getElementById("signupEmail").value.length > 250 || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(document.getElementById("signupEmail").value))
            utils.apiErrorHandler(4);
        else if (document.getElementById("signupPassword").value != document.getElementById("signupPasswordRepeat").value)
            utils.showPopUp("alertPopup", "Palavra-passe Inválida", "As palavras-passe inseridas não são iguais, por favor verifique e tente novamente.");
        else if (document.getElementById("signupPassword").value.length > 50 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/.test(document.getElementById("signupPassword").value))
            utils.apiErrorHandler(5);
        else {
            document.getElementById("loadBar").style.display = "block";
            document.getElementById("sidebar").setAttribute("disabled", "");
            document.getElementById("signupUsername").disabled = true;
            document.getElementById("signupEmail").disabled = true;
            document.getElementById("signupPassword").disabled = true;
            document.getElementById("signupPasswordRepeat").disabled = true;
            document.getElementById("signupButton").disabled = true;

            let success = await utils.accountManager(utils.accountMode.CHECK, {
                username: document.getElementById("signupUsername").value
            });

            document.getElementById("loadBar").style.display = "none";
            document.getElementById("sidebar").removeAttribute("disabled");
            document.getElementById("signupUsername").disabled = false;
            document.getElementById("signupEmail").disabled = false;
            document.getElementById("signupPassword").disabled = false;
            document.getElementById("signupPasswordRepeat").disabled = false;
            document.getElementById("signupButton").disabled = false;

            if (success)
                utils.switchSubpanels(document.getElementById("accountSignup"), document.getElementById("accountPersonalize"));
        }
    });

    document.getElementById("signupProfilePic").addEventListener("click", async () => {
        let profileDialog = await utils.showOpenDialog("Escolher imagem", [{ name: "Imagens", extensions: ["png", "jpg", "jpeg"] }], ["openFile"]);
        if (profileDialog.canceled)
            document.getElementById("personalizeProfilePic").style.setProperty("--image", "url(\"./icons/account.svg\")");
        else
            document.getElementById("personalizeProfilePic").style.setProperty("--image", "url(\"" + profileDialog.filePaths[0].replace(/\\/g, "/") + "\")");
    });

    document.getElementById("finishSignupButton").addEventListener("click", async () => {
        document.getElementById("finishSignupButton").disabled = true;
        document.getElementById("loadBar").style.display = "block";
        document.getElementById("sidebar").setAttribute("disabled", "");
        document.getElementById("signupProfilePic").disabled = true;

        let imagePath = document.getElementById("personalizeProfilePic").style.getPropertyValue("--image");
        imagePath = imagePath.slice(5, imagePath.length - 2);
        let success = await utils.accountManager(utils.accountMode.SIGNUP, {
            username: document.getElementById("signupUsername").value,
            email: document.getElementById("signupEmail").value,
            password: document.getElementById("signupPassword").value,
            picture: imagePath.endsWith(".svg") ? null : imagePath
        });

        document.getElementById("loadBar").style.display = "none";
        document.getElementById("sidebar").removeAttribute("disabled");
        document.getElementById("signupProfilePic").disabled = false;

        if (success) {
            utils.switchPanels("welcomePanel");
            document.getElementById("signupUsername").value = "";
            document.getElementById("signupEmail").value = "";
            document.getElementById("signupPassword").value = "";
            document.getElementById("signupPasswordRepeat").value = "";
        }
        else
            document.getElementById("finishSignupButton").disabled = false;
    });

    //#endregion

    //#region Welcome Panel
    
    document.getElementById("welcomeInitialButton").addEventListener("click", async () => utils.switchSubpanels(document.getElementById("welcomeInitial"), document.getElementById("welcomeSync")));
    
    document.getElementById("welcomeSyncButton").addEventListener("click", async () => utils.switchSubpanels(document.getElementById("welcomeSync"), document.getElementById("welcomeHome")));

    document.getElementById("welcomeHomeButton").addEventListener("click", async () => utils.switchSubpanels(document.getElementById("welcomeHome"), document.getElementById("welcomeRecovery")));
    
    document.getElementById("welcomeRecoveryButton").addEventListener("click", async () => {
        await utils.switchSubpanels(document.getElementById("welcomeRecovery"), document.getElementById("welcomeFinal"));
        await sleep(500);
        welcomeFinalAnimation(false);
    });

    document.getElementById("welcomeFinalButton").addEventListener("click", async () => {
        await sleep(200);
        welcomeFinalAnimation(true);
    });

    async function welcomeFinalAnimation(rollback) {
        if (!rollback) {
            document.querySelector("#welcomeFinal > div > imgx").style.transform = "scale(1)";
            document.querySelector("#welcomeFinal > div > imgx").style.opacity = "1";
            await sleep(1000);
            document.querySelector("#welcomeFinal > div > h1").style.opacity = "1";
            await sleep(400);
            document.querySelector("#welcomeFinal > div > h2").style.opacity = "1";
            await sleep(1000);
            document.querySelector("#welcomeFinal > button").style.opacity = "1";
        }
        else {
            document.querySelector("#welcomeFinal > div > imgx").style.removeProperty("transform");
            document.querySelector("#welcomeFinal > div > imgx").style.removeProperty("opacity");
            document.querySelector("#welcomeFinal > div > h1").removeAttribute("style");
            document.querySelector("#welcomeFinal > div > h2").removeAttribute("style");
            document.querySelector("#welcomeFinal > button").removeAttribute("style");
        }
    }

    //#endregion

    //#region Account Panel

    var profilePicSet;

    document.getElementById("accountEdit").addEventListener("click", async () => {
        let currentUserPicture = (await utils.accountManager(utils.accountMode.GET)).picture;
        profilePicSet = currentUserPicture != null ? currentUserPicture : "./icons/account.svg";
        utils.switchSubpanels(document.getElementById("accountMain"), document.getElementById("accountEditProfile"));
    });

    document.getElementById("accountChange").addEventListener("click", () => utils.switchSubpanels(document.getElementById("accountMain"), document.getElementById("accountChangePassword")));

    document.getElementById("accountLogoff").addEventListener("click", async () => {
        let popupResult = await utils.showPopUp("askPopup", "Terminar Sessão", "Tem a certeza que quer terminar sessão?");
        if (popupResult) {
            await sleep(200);
            utils.accountManager(utils.accountMode.LOGOUT);
            utils.switchPanels("homePanel");
        }
    });

    document.getElementById("editProfilePic").addEventListener("click", async () => {
        let profileDialog = await utils.showOpenDialog("Escolher imagem", [{ name: "Imagens", extensions: ["png", "jpg", "jpeg"] }], ["openFile"]);
        if (profileDialog.canceled)
            document.getElementById("editProfilePicIcon").style.setProperty("--image", profilePicSet);
        else
            document.getElementById("editProfilePicIcon").style.setProperty("--image", "url(\"" + profileDialog.filePaths[0].replace(/\\/g, "/") + "\")");
        unlockEditButton();
    });

    document.getElementById("editRemoveProfilePic").addEventListener("click", () => {
        if (!document.getElementById("editRemoveProfilePic").hasAttribute("disabled")) {
            document.getElementById("editProfilePicIcon").style.setProperty("--image", "url(\"./icons/account.svg\")");
            unlockEditButton();
        }
    });

    document.getElementById("editDelete").addEventListener("click", () => utils.switchSubpanels(document.getElementById("accountEditProfile"), document.getElementById("accountDelete")));

    document.getElementById("editUsername").addEventListener("keypress", enterEditButton);
    document.getElementById("editEmail").addEventListener("keypress", enterEditButton);
    document.getElementById("editUsername").addEventListener("input", unlockEditButton);
    document.getElementById("editEmail").addEventListener("input", unlockEditButton);

    function enterEditButton(event) {
        if (event.key == "Enter")
            document.getElementById("editButton").click();
    }

    function unlockEditButton() {
        if (document.getElementById("editUsername").value.length != 0 || document.getElementById("editEmail").value.length != 0 || document.getElementById("editProfilePicIcon").style.getPropertyValue("--image") != profilePicSet)
            document.getElementById("editButton").disabled = false;
        else
            document.getElementById("editButton").disabled = true;
    }

    document.getElementById("editButton").addEventListener("click", async () => {
        document.getElementById("editButton").disabled = true;
        document.getElementById("loadBar").style.display = "block";
        document.getElementById("sidebar").setAttribute("disabled", "");
        document.getElementById("editUsername").disabled = true;
        document.getElementById("editEmail").disabled = true;
        document.getElementById("editProfilePic").disabled = true;
        document.getElementById("editRemoveProfilePic").setAttribute("disabled", "");
        document.getElementById("editDelete").disabled = true;

        let imagePath = document.getElementById("editProfilePicIcon").style.getPropertyValue("--image");
        imagePath = imagePath.slice(5, imagePath.length - 2).split("?")[0];
        let success = await utils.accountManager(utils.accountMode.EDIT, {
            newUsername: document.getElementById("editUsername").value == "" ? null : document.getElementById("editUsername").value,
            email: document.getElementById("editEmail").value == "" ? null : document.getElementById("editEmail").value,
            pictureChange: imagePath != profilePicSet,
            picture: imagePath
        });

        document.getElementById("loadBar").style.display = "none";
        document.getElementById("sidebar").removeAttribute("disabled");
        document.getElementById("editUsername").disabled = false;
        document.getElementById("editEmail").disabled = false;
        document.getElementById("editProfilePic").disabled = false;
        document.getElementById("editRemoveProfilePic").removeAttribute("disabled");
        document.getElementById("editDelete").disabled = false;

        if (success) {
            await utils.switchPanels("accountPanel");
            document.getElementById("editUsername").value = "";
            document.getElementById("editEmail").value = "";
        }
        else
            document.getElementById("editButton").disabled = false;
    });

    document.getElementById("changePassword").addEventListener("keypress", enterChangeButton);
    document.getElementById("changePasswordRepeat").addEventListener("keypress", enterChangeButton);
    document.getElementById("changePassword").addEventListener("input", unlockChangeButton);
    document.getElementById("changePasswordRepeat").addEventListener("input", unlockChangeButton);

    function enterChangeButton(event) {
        if (event.key == "Enter")
            document.getElementById("changeButton").click();
    }

    function unlockChangeButton() {
        if (document.getElementById("changePassword").value.length != 0 && document.getElementById("changePasswordRepeat").value.length != 0)
            document.getElementById("changeButton").disabled = false;
        else
            document.getElementById("changeButton").disabled = true;
    }

    document.getElementById("changeButton").addEventListener("click", async () => {
        if (document.getElementById("changePassword").value != document.getElementById("changePasswordRepeat").value)
            utils.showPopUp("alertPopup", "Palavra-passe Inválida", "As palavras-passe inseridas não são iguais, por favor verifique e tente novamente.");
        else {
            document.getElementById("changeButton").disabled = true;
            document.getElementById("loadBar").style.display = "block";
            document.getElementById("sidebar").setAttribute("disabled", "");
            document.getElementById("changePassword").disabled = true;
            document.getElementById("changePasswordRepeat").disabled = true;

            let success = await utils.accountManager(utils.accountMode.EDIT_PASSWORD, {
                password: document.getElementById("changePassword").value
            });

            document.getElementById("loadBar").style.display = "none";
            document.getElementById("sidebar").removeAttribute("disabled");
            document.getElementById("changePassword").disabled = false;
            document.getElementById("changePasswordRepeat").disabled = false;

            if (success) {
                await utils.showPopUp("alertPopup", "Palavra-passe alterada", "A sua palavra-passe foi alterada com sucesso!");
                await utils.switchPanels("accountPanel");
                document.getElementById("changePassword").value = "";
                document.getElementById("changePasswordRepeat").value = "";
            }
            else
                document.getElementById("changeButton").disabled = false;
        }
    });

    document.getElementById("accountDeleteButton").addEventListener("click", () => utils.switchSubpanels(document.getElementById("accountDelete"), document.getElementById("accountDeleteConfirm")));

    document.getElementById("deletePassword").addEventListener("keypress", (event) => {
        if (event.key == "Enter")
            document.getElementById("accountConfirmDeleteButton").click();
    });

    document.getElementById("deletePassword").addEventListener("input", () => {
        if (document.getElementById("deletePassword").value.length >= 8)
            document.getElementById("accountConfirmDeleteButton").disabled = false;
        else
            document.getElementById("accountConfirmDeleteButton").disabled = true;
    });

    document.getElementById("accountConfirmDeleteButton").addEventListener("click", async () => {
        let popupResult = await utils.showPopUp("askPopup", "Tem mesmo a certeza?", "Os seus dados serão eliminados de forma irreversivel! Uma vez iniciado o processo de eliminação da conta, o mesmo não poderá ser cancelado!");
        if (popupResult) {
            document.getElementById("sidebar").setAttribute("disabled", "");
            await utils.switchSubpanels(document.getElementById("accountDeleteConfirm"), document.getElementById("accountDeleteProgress"));
            document.getElementById("loadBar").style.display = "block";

            let success = await utils.accountManager(utils.accountMode.DELETE, { password: document.getElementById("deletePassword").value });
            if (!success)
                await utils.switchSubpanels(document.getElementById("accountDeleteProgress"), document.getElementById("accountDeleteConfirm"));

            document.getElementById("deletePassword").value = "";
            document.getElementById("sidebar").removeAttribute("disabled");
            document.getElementById("loadBar").style.display = "none";

            utils.switchPanels("homePanel");
        }
    });

    //#endregion

    //#region Settings Panel

    document.getElementById("settingsAppearance").addEventListener("change", async () => {
        let styleElement = document.createElement("style");
        styleElement.id = "styleElement";
        styleElement.innerText = "* { transition: background-color 0.4s, color 0.4s !important; }";
        document.body.appendChild(styleElement);

        if (Boolean(Number(document.getElementById("settingsAppearance").value)))
            document.body.setAttribute("theme", "dark");
        else
            document.body.setAttribute("theme", "light");
        
        utils.setSetting("settings.darkMode", Boolean(Number(document.getElementById("settingsAppearance").value)));
        await sleep(400);
        document.body.removeChild(styleElement);
    });

    document.getElementById("settingsSaveHistory").addEventListener("change", () => utils.setSetting("settings.saveHistory", document.getElementById("settingsSaveHistory").checked));

    document.getElementById("settingsAutoUpdate").addEventListener("change", () => utils.setSetting("settings.autoUpdate", document.getElementById("settingsAutoUpdate").checked));

    document.getElementById("settingsBetaUpdates").addEventListener("change", () => utils.setSetting("settings.betaUpdates", document.getElementById("settingsBetaUpdates").checked));

    document.getElementById("settingsVersion").addEventListener("click", () => {
        upSideDown++;
        clearTimeout(upSideDownTimeOut);
        upSideDownTimeOut = setTimeout(() => upSideDown = 0, 400);
        if (upSideDown == 5) {
            upSideDown = 0;
            if (!document.body.hasAttribute("style"))
                document.body.style.transform = "rotateZ(180deg)";
            else
                document.body.removeAttribute("style");
        }
    });
    
    //#endregion
});