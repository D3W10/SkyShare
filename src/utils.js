const { clipboard, ipcRenderer } = require("electron");
const fs = require("fs");
const log = require("electron-log");
const showdown = require("showdown");
const axios = require("axios").default;
const crypto = require("crypto");
const package = require("../package.json");
var currentPanel = "homePanel";

Object.assign(console, log.functions);
log.transports.file.fileName = "logs.log";

//#region Functions

function closeWindow() {
    ipcRenderer.send("WinClose");
}

function minimizeWindow() {
    ipcRenderer.send("WinMinimize");
}

async function reloadIcons() {
    for (const icon of document.getElementsByTagName("icon")) {
        try {
            let iconXML = await fetch("./assets/icons/" + icon.getAttribute("name") + ".svg");
            icon.innerHTML = await iconXML.text();
        }
        catch {
            console.warn("Não foi possível carregar o icone: " + icon.getAttribute("name"));
        }
    }
}

function openMain() {
    ipcRenderer.send("OpenMain");
}

function openPanel() {
    return currentPanel;
}

async function getPaths(name) {
    return await ipcRenderer.sendSync("GetPaths", name);
}

async function getUrlPath() {
    return await ipcRenderer.sendSync("GetUrlPath");
}

async function getSetting(name) {
    return await ipcRenderer.sendSync("GetSetting", name);
}

function setSetting(name, value) {
    return ipcRenderer.send("SetSetting", name, value);
}

async function getChanges() {
    return await ipcRenderer.sendSync("GetChanges");
}

async function switchPanels(to) {
    for (const selectedTab of document.getElementsByClassName("selected"))
        selectedTab.classList.remove("selected");

    for (const sidebarOption of document.getElementById("sidebar").children) {
        if (sidebarOption.getAttribute("goto") == to)
            sidebarOption.classList.add("selected");
    }

    document.getElementById(currentPanel).style.opacity = "0";
    await sleep(200);
    document.getElementById(currentPanel).style.display = "none";

    for (const subPanel of document.getElementById(to).children)
        subPanel.removeAttribute("style");

    currentPanel = to;

    document.getElementById(to).style.display = "flex";
    await sleep(200);
    document.getElementById(to).removeAttribute("style");
}

async function switchSubpanels(from, to) {
    let fromI = 0, toI = 0;
    for (let i = 0; i < from.parentElement.children.length; i++) {
        if (from.parentElement.children[i] == from)
            fromI = i;
        if (from.parentElement.children[i] == to)
            toI = i;
    }

    if (fromI <= toI)
        from.style.transform = "translateX(-30px)";
    else
        from.style.transform = "translateX(30px)";
    from.style.opacity = "0";
    await sleep(200);
    from.style.display = "none";
    to.style.display = "flex";
    await sleep(50);
    to.style.transform = "translateX(0px)";
    to.style.opacity = "1";
}

async function updateGreeting() {
    let currentHour = new Date().getHours();

    if (currentHour >= 8 && currentHour <= 12)
        document.getElementById("greetingTime").innerText = "Bom dia";
    else if (currentHour >= 13 && currentHour <= 19)
        document.getElementById("greetingTime").innerText = "Boa tarde";
    else if (currentHour >= 20 || currentHour <= 7)
        document.getElementById("greetingTime").innerText = "Boa noite";

    if (Object.keys(await accountManager(accountMode.GET)).length != 0)
        document.getElementById("greetingTime").innerText += " ";
}

function checkFolder(path) {
    return fs.lstatSync(path).isDirectory();
}

function sendFile(files, message) {
    return new Promise((resolve) => {
        ipcRenderer.send("SendFile", files, message);
        ipcRenderer.once("SendFileComplete", onSendFileComplete);

        async function onSendFileComplete(_event, data, status) {
            let errorHandler = await apiErrorHandler(data.code, status);
            if (errorHandler) {
                document.getElementById("loadBar").style.display = "none";
                switchSubpanels(document.getElementById("filesPrepare"), document.getElementById("filesUploading"));
                ipcRenderer.send("SetProgressBar", "0");
    
                let pgsRepeat = setInterval(async () => {
                    let apiResult = await axios.get(data.value.progressUrl, { validateStatus: () => true });
                    let errorHandler2 = await apiErrorHandler(apiResult.data.code, apiResult.status);

                    if (errorHandler2) {
                        ipcRenderer.send("SetProgressBar", apiResult.data.value.percentage);
                        document.querySelector("#uploadProgress > svg").style.setProperty("--value", apiResult.data.value.percentage);
                        document.querySelector("#uploadProgress > p").innerText = apiResult.data.value.percentage;
                        document.getElementById("uploadEta").innerText = apiResult.data.value.eta == undefined ? "0 segundos" : apiResult.data.value.eta;
                        document.getElementById("uploadSpeed").innerText = apiResult.data.value.speed == undefined ? "0.00 MB/s" : apiResult.data.value.speed;
                        if (apiResult.data.value.percentage == 100) {
                            clearInterval(pgsRepeat);
                            ipcRenderer.send("SetProgressBar", "-100");
                            reloadHistory();
                            resolve(apiResult.data.value.transfer);
                        }
                    }
                    else {
                        clearInterval(pgsRepeat);
                        ipcRenderer.send("SetProgressBar", "-100");
                        resolve(false);
                    }
                }, 1000);
            }
            else
                resolve(false);
        }
    });
}

function receiveFile(code) {
    return new Promise(async (resolve) => {
        let apiResult = await axios.get(package.api + "file/" + code + "/info", { validateStatus: () => true });
        let errorHandler = await apiErrorHandler(apiResult.data.code, apiResult.status);

        if (errorHandler) {
            if (apiResult.data.value.message != null)
                document.getElementById("transferMessage").innerText = apiResult.data.value.message;
            else
                document.getElementById("transferMessage").innerHTML = "<i>Sem mensagem</i>";

            if (apiResult.data.value.sentBy != null)
                document.getElementById("transferSentBy").innerText = apiResult.data.value.sentBy;
            else
                document.getElementById("transferSentBy").innerHTML = "<i>Convidado</i>";

            document.getElementById("receiveInfo").removeAttribute("disabled");
            let saveDialog = await showSaveDialog("Guardar ficheiro", apiResult.data.value.fileName, [{ name: "Ficheiro (" + apiResult.data.value.fileName.match(/\.[0-9a-z]+$/g)[0] + ")", extensions: [ apiResult.data.value.fileName.match(/[0-9a-z]+$/g)[0] ] }]);
            if (saveDialog.canceled)
                return resolve(false);

            document.querySelector("#receiveSide > pbar").style.opacity = "1";
            ipcRenderer.send("ReceiveFile", code, saveDialog.filePath);
            ipcRenderer.on("ReceiveFileProgress", onReceiveFileProgress);
            ipcRenderer.once("ReceiveFileComplete", onReceiveFileComplete);

            function onReceiveFileProgress(_event, progress) {
                document.querySelector("#receiveSide > pbar").style.setProperty("--value", progress + "%");
            }

            async function onReceiveFileComplete() {
                resolve(true);

                reloadHistory();
                document.querySelector("#receiveSide > pbar").style.opacity = "0";
                await sleep(400);
                document.querySelector("#receiveSide > pbar").removeAttribute("style");
                ipcRenderer.off("ReceiveFileProgress", onReceiveFileProgress);
            }

            return;
        }
        resolve(errorHandler);
    });
}

async function accountManager(mode, args) {
    if (mode == accountMode.GET)
        return await ipcRenderer.sendSync("AccountStorage", false);
    else if (mode == accountMode.CHECK) {
        let apiResult = await axios.post(package.api + "user/check/", { username: args.username }, { validateStatus: () => true });
        let errorHandler = await apiErrorHandler(apiResult.data.code, apiResult.status);
        if (errorHandler && !apiResult.data.value)
            showPopUp("alertPopup", "Nome já utilizado", "O nome de utilizador inserido já está em utilização, por favor escolha outro.");

        return errorHandler ? apiResult.data.value : false;
    }
    else if (mode == accountMode.SIGNUP) {
        return new Promise((resolve) => {
            ipcRenderer.send("AccountSignUp", args);
            ipcRenderer.once("AccountSignUpComplete", onAccountSignUpComplete);

            async function onAccountSignUpComplete(_event, data, status) {
                let errorHandler = await apiErrorHandler(data.code, status);
                if (errorHandler) {
                    args.password = crypto.createHash("sha512").update(args.password).digest("hex");
                    ipcRenderer.send("AccountStorage", true, Object.assign(data.value, { password: args.password }));
                    fs.writeFileSync((await getPaths("userData")) + "\\account.json", JSON.stringify({
                        username: args.username,
                        password: args.password
                    }, null, 4), "utf8");
                    reloadAccount();
                    document.getElementById("welcomeRecoveryKey").innerText = data.value.recoveryKey;
                }

                resolve(errorHandler);
            }
        });
    }
    else if (mode == accountMode.LOGIN) {
        args.password = crypto.createHash("sha512").update(args.password).digest("hex");
        let apiResult = await axios.post(package.api + "user/login", {
            username: args.username,
            password: args.password
        }, { validateStatus: () => true });
        let errorHandler = await apiErrorHandler(apiResult.data.code, apiResult.status);

        if (errorHandler) {
            ipcRenderer.send("AccountStorage", true, Object.assign(apiResult.data.value, { password: args.password }));
            fs.writeFileSync((await getPaths("userData")) + "\\account.json", JSON.stringify({
                username: args.username,
                password: args.password
            }, null, 4), "utf8");
            reloadAccount();
        }
        return errorHandler;
    }
    else if (mode == accountMode.LOGINSTART) {
        if (fs.existsSync((await getPaths("userData")) + "\\account.json")) {
            try {
                let credentials = JSON.parse(fs.readFileSync((await getPaths("userData")) + "\\account.json", "utf8"));
                let apiResult = await axios.post(package.api + "user/login", {
                    username: credentials.username,
                    password: credentials.password
                }, { validateStatus: () => true });
    
                if (apiResult.status == 200 && apiResult.data.code == 0) {
                    ipcRenderer.send("AccountStorage", true, Object.assign(apiResult.data.value, { password: credentials.password }));
                    return true;
                }
                else if (apiResult.status == 200) {
                    fs.unlinkSync((await getPaths("userData")) + "\\account.json");
                    return false;
                }
                else
                    return false;
            }
            catch {
                return false;
            }
        }
        return true;
    }
    else if (mode == accountMode.EDIT) {
        return new Promise((resolve) => {
            ipcRenderer.send("AccountEditInfo", args);
            ipcRenderer.once("AccountEditInfoComplete", onAccountEditInfoComplete);

            async function onAccountEditInfoComplete(_event, data, status) {
                let currentUser = await accountManager(accountMode.GET);
                let errorHandler = await apiErrorHandler(data.code, status);
                if (errorHandler) {
                    ipcRenderer.send("AccountStorage", true, Object.assign(data.value, { password: currentUser.password }));
                    fs.writeFileSync((await getPaths("userData")) + "\\account.json", JSON.stringify({
                        username: data.value.username,
                        password: currentUser.password
                    }, null, 4), "utf8");
                    reloadAccount();
                }

                resolve(errorHandler);
            }
        });
    }
    else if (mode == accountMode.EDIT_PASSWORD) {
        let currentUser = await accountManager(accountMode.GET);
        let apiResult = await axios.put(package.api + "user/" + currentUser.username + "/edit/password", {
            password: currentUser.password,
            newPassword: args.password
        }, { validateStatus: () => true });
        let errorHandler = await apiErrorHandler(apiResult.data.code, apiResult.status);

        if (errorHandler) {
            args.password = crypto.createHash("sha512").update(args.password).digest("hex");
            ipcRenderer.send("AccountStorage", true, Object.assign(apiResult.data.value, { password: args.password }));
            fs.writeFileSync((await getPaths("userData")) + "\\account.json", JSON.stringify({
                username: currentUser.username,
                password: args.password
            }, null, 4), "utf8");
        }

        return errorHandler;
    }
    else if (mode == accountMode.RECOVERY_CHECK) {
        let apiResult = await axios.post(package.api + "user/recovery/check", {
            username: args.username,
            recoveryKey: crypto.createHash("sha512").update(args.recoveryKey).digest("hex")
        }, { validateStatus: () => true });
        let errorHandler = await apiErrorHandler(apiResult.data.code, apiResult.status);
        if (errorHandler && !apiResult.data.value)
            showPopUp("alertPopup", "Dados incorretos", "O nome de utilizador ou chave inserida estão incorretos, verifique se os escreveu corretamente e tente novamente.");

        return errorHandler ? apiResult.data.value : false;
    }
    else if (mode == accountMode.PASSWORD_RECOVERY) {
        let apiResult = await axios.post(package.api + "user/recovery/password", {
            username: args.username,
            recoveryKey: crypto.createHash("sha512").update(args.recoveryKey).digest("hex"),
            newPassword: args.password
        }, { validateStatus: () => true });
        let errorHandler = await apiErrorHandler(apiResult.data.code, apiResult.status);

        if (errorHandler) {
            args.password = crypto.createHash("sha512").update(args.password).digest("hex");
            ipcRenderer.send("AccountStorage", true, Object.assign(apiResult.data.value, { password: args.password }));
            fs.writeFileSync((await getPaths("userData")) + "\\account.json", JSON.stringify({
                username: args.username,
                password: args.password
            }, null, 4), "utf8");
            reloadAccount();
            showPopUp("boxPopup", "Sucesso", "A sua conta foi restaurada com sucesso, guarde esta nova chave de recuperação para o caso de se esquecer da palavra-passe no futuro.", apiResult.data.value.recoveryKey);
        }

        return errorHandler;
    }
    else if (mode == accountMode.LOGOUT) {
        ipcRenderer.send("AccountStorage", true, {});
        fs.unlinkSync((await getPaths("userData")) + "\\account.json");
        reloadAccount();
    }
    else if (mode == accountMode.DELETE) {
        let currentUser = await accountManager(accountMode.GET);
        let apiResult = await axios.post(package.api + "user/" + currentUser.username + "/delete", {
            password: crypto.createHash("sha512").update(args.password).digest("hex")
        }, { validateStatus: () => true });
        let errorHandler = await apiErrorHandler(apiResult.data.code, apiResult.status);

        if (errorHandler) {
            ipcRenderer.send("AccountStorage", true, {});
            fs.unlinkSync((await getPaths("userData")) + "\\account.json");
            reloadAccount();

            await showPopUp("alertPopup", "Sucesso", "A sua conta foi apagada com sucesso. Esperamos que nos possamos ver em breve!");
        }

        return errorHandler;
    }
}

async function reloadAccount() {
    let currentUser = await accountManager(accountMode.GET);

    if (Object.keys(currentUser).length != 0) {
        document.getElementById("greetingName").innerText = currentUser.username;
        document.getElementById("sidebarName").innerText = currentUser.username;
        document.getElementById("welcomeFinalUsername").innerText = currentUser.username;
        document.getElementById("accountName").innerText = currentUser.username;
        document.getElementById("editUsername").setAttribute("placeholder", currentUser.username);
        document.getElementById("editEmail").setAttribute("placeholder", currentUser.email);

        document.getElementById("sidebarPicture").parentElement.setAttribute("goto", "accountPanel");
        document.getElementById("settingsHistory").classList.add("loggedOn");

        let time = new Date();
        for (const accountPicture of document.getElementsByClassName("accountPicture")) {
            if (currentUser.picture != null)
                accountPicture.style.setProperty("--image", "url(\"" + currentUser.picture + "?" + time.toLocaleTimeString() + "\")");
            else
                accountPicture.style.setProperty("--image", "url(\"./icons/account.svg\")");
        }
    }
    else {
        document.getElementById("greetingName").innerText = "";
        document.getElementById("sidebarName").innerText = "Iniciar Sessão";

        for (const accountPicture of document.getElementsByClassName("accountPicture"))
            accountPicture.style.setProperty("--image", "url(\"./icons/account.svg\")");

        document.getElementById("sidebarPicture").parentElement.setAttribute("goto", "loginPanel");
        document.getElementById("settingsHistory").classList.remove("loggedOn");
    }
    await reloadHistory();
    await updateGreeting();
}

async function reloadHistory() {
    let currentUser = await accountManager(accountMode.GET);

    document.getElementById("homeDetailed").replaceChildren();
    if (Object.keys(currentUser).length != 0) {
        let credentials = JSON.parse(fs.readFileSync((await getPaths("userData")) + "\\account.json", "utf8"));
        let apiResult = await axios.post(package.api + "user/" + currentUser.username + "/history", { password: credentials.password }, { validateStatus: () => true });

        let historyObj = apiResult.data.value;
        let errorHandler = await apiErrorHandler(apiResult.data.code, apiResult.status);
        if (errorHandler && historyObj.length != 0) {
            for (const entry of historyObj.reverse()) {
                let divContainer = document.createElement("div"), divLeftContainer = document.createElement("div"), icon = document.createElement("icon"), divTextContainer = document.createElement("div"), titleSpan = document.createElement("span"), subtitleSpan = document.createElement("span"), divRightContainer = document.createElement("div"), copyIcon = document.createElement("icon"), copyLinkIcon = document.createElement("icon");

                icon.setAttribute("name", entry.type == 0 ? "historySend" : "historyReceive");
                titleSpan.innerText = entry.type == 0 ? "Ficheiro Enviado" : "Ficheiro Recebido";
                subtitleSpan.innerHTML = entry.code + "&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;" + new Date(entry.date).toLocaleDateString() + "&nbsp;&nbsp;" + new Date(entry.date).toLocaleTimeString().substring(0, 5);
                copyIcon.setAttribute("name", "copy");
                copyIcon.title = "Copiar";
                copyLinkIcon.setAttribute("name", "link");
                copyLinkIcon.title = "Copiar Link";

                divTextContainer.appendChild(titleSpan);
                divTextContainer.appendChild(subtitleSpan);
                divLeftContainer.appendChild(icon);
                divLeftContainer.appendChild(divTextContainer);
                divRightContainer.appendChild(copyIcon);
                divRightContainer.appendChild(copyLinkIcon);
                divContainer.appendChild(divLeftContainer);
                divContainer.appendChild(divRightContainer);

                copyIcon.addEventListener("click", async (event) => {
                    if (!event.currentTarget.parentElement.parentElement.hasAttribute("disabled")) {
                        let entryDiv = event.currentTarget.parentElement.parentElement;
                        entryDiv.setAttribute("disabled", "");

                        let code = entryDiv.querySelector("div > span:last-of-type").innerText.substring(0, 6), titleSpanRewind = entryDiv.querySelector("div > span:first-of-type").innerText;
                        copyToClipboard(code);
                        entryDiv.querySelector("div > span:first-of-type").style.opacity = 0;
                        await sleep(200);
                        entryDiv.querySelector("div > span:first-of-type").innerText = "Código copiado!";
                        entryDiv.querySelector("div > span:first-of-type").removeAttribute("style");
                        await sleep(3200);
                        entryDiv.querySelector("div > span:first-of-type").style.opacity = 0;
                        await sleep(200);
                        entryDiv.querySelector("div > span:first-of-type").innerText = titleSpanRewind;
                        entryDiv.querySelector("div > span:first-of-type").removeAttribute("style");

                        entryDiv.removeAttribute("disabled");
                    }
                });

                copyLinkIcon.addEventListener("click", async (event) => {
                    if (!event.currentTarget.parentElement.parentElement.hasAttribute("disabled")) {
                        let entryDiv = event.currentTarget.parentElement.parentElement;
                        entryDiv.setAttribute("disabled", "");

                        let code = entryDiv.querySelector("div > span:last-of-type").innerText.substring(0, 6), titleSpanRewind = entryDiv.querySelector("div > span:first-of-type").innerText;
                        copyToClipboard(package.url + "?dl=" + code);
                        entryDiv.querySelector("div > span:first-of-type").style.opacity = 0;
                        await sleep(200);
                        entryDiv.querySelector("div > span:first-of-type").innerText = "Link copiado!";
                        entryDiv.querySelector("div > span:first-of-type").removeAttribute("style");
                        await sleep(3200);
                        entryDiv.querySelector("div > span:first-of-type").style.opacity = 0;
                        await sleep(200);
                        entryDiv.querySelector("div > span:first-of-type").innerText = titleSpanRewind;
                        entryDiv.querySelector("div > span:first-of-type").removeAttribute("style");

                        entryDiv.removeAttribute("disabled");
                    }
                });

                document.getElementById("homeDetailed").appendChild(divContainer);
            }

            document.querySelector("#homePanel > div").classList.add("detailed");
            await reloadIcons();
        }
    }
    else
        document.querySelector("#homePanel > div").classList.remove("detailed");
}

function copyToClipboard(value) {
    clipboard.writeText(value);
}

async function showOpenDialog(title, filters, properties) {
    return await ipcRenderer.sendSync("ShowDialog", "OPEN", {
        title: title,
        filters: filters,
        properties: properties
    });
}

async function showSaveDialog(title, defaultPath, filters) {
    return await ipcRenderer.sendSync("ShowDialog", "SAVE", {
        title: title,
        defaultPath: defaultPath,
        filters: filters
    });
}

async function showErrorDialog(title, content) {
    return await ipcRenderer.sendSync("ShowDialog", "ERROR", {
        title: title,
        content: content
    });
}

function showPopUp(type, title, text, boxText) {
    return new Promise(async (resolve) => {
        document.querySelector("#" + type + " > h1").innerText = title;

        if (type == "alertPopup" || type == "askPopup")
            document.querySelector("#" + type + " > p").innerText = text;
        else if (type == "changelogPopup")
            document.querySelector("#" + type + " > div").innerHTML = new showdown.Converter().makeHtml(boxText);
        else if (type == "boxPopup") {
            document.querySelector("#" + type + " > p").innerText = text;
            document.querySelector("#" + type + " > div").innerText = boxText;
        }
    
        async function closePopUp(event) {
            if (event.currentTarget == event.target) {
                resolve(event.currentTarget.id == "askPopupButtonYes");
                
                document.getElementById("popups").style.opacity = "0";
                document.getElementById(type).style.opacity = "0";
                document.getElementById(type).style.transform = "scale(0.5)";
                await sleep(200);
                document.getElementById(type).removeAttribute("style");
                document.getElementById("popups").removeAttribute("style");
            }
        }
    
        document.getElementById("popups").style.display = "flex";
        await sleep(50);
        document.getElementById("popups").style.opacity = "1";
        document.getElementById(type).style.display = "block";
        await sleep(50);
        document.getElementById(type).style.opacity = "1";
        document.getElementById(type).style.transform = "scale(1)";
    
        document.getElementById("popups").addEventListener("click", closePopUp, { once: true });
    
        if (type == "alertPopup")
            document.getElementById("alertPopupButton").addEventListener("click", closePopUp, { once: true });
        else if (type == "askPopup") {
            document.getElementById("askPopupButtonYes").addEventListener("click", closePopUp, { once: true });
            document.getElementById("askPopupButtonNo").addEventListener("click", closePopUp, { once: true });
        }
        else if (type == "changelogPopup")
            document.getElementById("changelogPopupButton").addEventListener("click", closePopUp, { once: true });
        else if (type == "boxPopup")
            document.getElementById("boxPopupButton").addEventListener("click", closePopUp, { once: true });
    });
}

async function apiErrorHandler(code, status) {
    let strings = ["Erro desconhecido", "O servidor devolveu um erro não conhecido. Verifique se tem a versão mais recente do " + package.productName + " e tente novamente."];

    switch (code) {
        case 0:
            return true;
        case 1:
            strings = ["Parâmetros em Falta", "Um dos parâmetros obrigatórios está em falta."];
            break;
        case 2:
            strings = ["Parâmetros em Falta", "Nenhum dos parâmetros a modificar foram providenciados."];
            break;
        case 3:
            strings = ["Nome de Utilizador Inválido", "O nome de utilizador deve ser composto apenas por números, letras ou algum destes caracteres: \".\" \"-\" \"_\"."];
            break;
        case 4:
            strings = ["Email Inválido", "O endereço de email inserido não é válido. Por favor verifique se o escreveu corretamente e tente novamente."];
            break;
        case 5:
            strings = ["Palavra-Passe Inválida", "A palavra-passe inserida deve ter pelo menos 8 caracteres, uma letra minúscula, uma maiúscula e um número."];
            break;
        case 6:
            strings = ["Palavra-Passe Inválida", "A nova palavra-passe deve ter pelo menos 8 caracteres, uma letra minúscula, uma maiúscula e um número."];
            break;
        case 7:
            strings = ["Dados Inválidos", "O nome de utilizador ou a palavra-passe inseridos estão incorretos, por favor tente novamente."];
            break;
        case 8:
            strings = ["Nome já utilizado", "O nome de utilizador inserido já está em utilização, por favor escolha outro."];
            break;
        case 9:
            strings = ["Erro desconhecido", "Ocorreu um erro ao tentar criar a sua conta. Por favor tente novamente mais tarde."];
            break;
        case 10:
            strings = ["Erro desconhecido", "Ocorreu um erro ao tentar verificar o seu nome de utilizador. Por favor tente novamente mais tarde."];
            break;
        case 11:
            strings = ["Erro desconhecido", "Ocorreu um erro ao tentar editar o seu perfil. Por favor tente novamente mais tarde."];
            break;
        case 12:
            strings = ["Foto de Perfil", "Nenhuma foto de perfil foi enviada."];
            break;
        case 13:
            strings = ["Erro desconhecido", "Ocorreu um erro na alteração da palavra-passe. Por favor tente novamente mais tarde."];
            break;
        case 14:
            strings = ["Chave Inválida", "A chave de recuperação inserida não é uma chave válida, verifique se a escreveu corretamente e tente novamente."];
            break;
        case 15:
            strings = ["Dados Inválidos", "O nome de utilizador ou a chave de recuperação inseridos estão incorretos, por favor tente novamente."];
            break;
        case 16:
            strings = ["Foto de Perfil", "Este utilizador não tem foto de perfil."];
            break;
        case 17:
            strings = ["Palavra-passe em utilização", "A nova palavra-passe não poderá ser igual à atual."];
            break;
        case 18:
            strings = ["Nome de Utilizador Inválido", "O novo nome de utilizador deve ser composto apenas por números, letras ou algum destes caracteres: \".\" \"-\" \"_\"."];
            break;
        case 19:
            strings = ["Email Inválido", "O novo endereço de email não é válido. Por favor verifique se o escreveu corretamente e tente novamente."];
            break;
        case 20:
            strings = ["Foto de Perfil muito grande", "A foto de perfil escolhida é maior que 3 MB. Por favor escolha uma foto com um tamanho menor."];
            break;
        case 21:
            strings = ["Foto de Perfil inválida", "A foto de perfil escolhida não está em nenhum dos formatos permitidos."];
            break;
        case 22:
            strings = ["Nenhum ficheiro", "Nenhum ficheiro enviado."];
            break;
        case 23:
            strings = ["Mensagem Inválida", "A sua mensagem é demasiado grande. Por favor resuma-a e tente novamente."];
            break;
        case 24:
            strings = ["Limite excedido", "A quantidade máxima de ficheiros que pode enviar é 50."];
            break;
        case 25:
            strings = ["Limite excedido", "O tamanho total dos ficheiros não pode ser superior a 1 GB."];
            break;
        case 26:
            strings = ["Erro desconhecido", "Ocorreu um erro ao tentar gerar um código de envio. Por favor tente novamente mais tarde."];
            break;
        case 27:
            strings = ["Código Inválido", "O código de envio inserido não é válido. Por favor tente novamente."];
            break;
        case 28:
            strings = ["Código Inválido", "O código de envio inserido não é de uma transferência existente. Verifique se o escreveu corretamente e tente novamente."];
            break;
        case 29:
            strings = ["Erro desconhecido", "Ocorreu um erro ao tentar verificar o código de envio. Por favor tente novamente mais tarde."];
            break;
        case 30:
            strings = ["Erro desconhecido", "Ocorreu um erro ao tentar obter os dados da transferência. Por favor tente novamente mais tarde."];
            break;
        case 31:
            strings = ["Código Inválido", "O código de envio não é de uma transferência em progresso."];
            break;
        case 44:
            strings = ["Erro na Conexão", "Ocorreu um erro inesperado. Verifique se tem a versão mais recente do " + package.productName + " e tente novamente."];
            break;
        case 50:
            strings = ["Erro de Servidor", "Ocorreu um erro inesperado no servidor o que fez com que o seu pedido não pudesse ser realizado. Tente novamente mais tarde."];
            break;
        default:
            if (status == 503)
                strings = ["Erro de Servidor", "O servidor não está em funcionamento neste momento. Por favor tente novamente mais tarde."];
            break;
    }

    await showPopUp("alertPopup", strings[0], strings[1]);
    return false;
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

//#endregion

ipcRenderer.once("ReloadAccount", async () => {
    await reloadAccount();
    openMain();
});

//#region Enumerators

const selectMode = {
    CLICK: 0,
    DROP: 1
}

const dragMode = {
    ENTER: 0,
    LEAVE: 1,
    DROP: 2
}

const accountMode = {
    GET: 0,
    CHECK: 1,
    SIGNUP: 2,
    LOGIN: 3,
    LOGINSTART: 4,
    EDIT: 5,
    EDIT_PASSWORD: 6,
    RECOVERY_CHECK: 7,
    PASSWORD_RECOVERY: 8,
    LOGOUT: 9,
    DELETE: 10
}

//#endregion

exports.package = package;
exports.closeWindow = closeWindow;
exports.minimizeWindow = minimizeWindow;
exports.reloadIcons = reloadIcons;
exports.openMain = openMain;
exports.openPanel = openPanel;
exports.getPaths = getPaths;
exports.getUrlPath = getUrlPath;
exports.getSetting = getSetting;
exports.setSetting = setSetting;
exports.getChanges = getChanges;
exports.switchPanels = switchPanels;
exports.switchSubpanels = switchSubpanels;
exports.updateGreeting = updateGreeting;
exports.checkFolder = checkFolder;
exports.sendFile = sendFile;
exports.receiveFile = receiveFile;
exports.accountManager = accountManager;
exports.reloadAccount = reloadAccount;
exports.reloadHistory = reloadHistory;
exports.copyToClipboard = copyToClipboard;
exports.showOpenDialog = showOpenDialog;
exports.showSaveDialog = showSaveDialog;
exports.showErrorDialog = showErrorDialog;
exports.showPopUp = showPopUp;
exports.apiErrorHandler = apiErrorHandler;
exports.sleep = sleep;

exports.selectMode = selectMode;
exports.dragMode = dragMode;
exports.accountMode = accountMode;