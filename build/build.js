const builder = require("electron-builder");
const Platform = builder.Platform;

/**
* @type {import('electron-builder').Configuration}
* @see https://www.electron.build/configuration/configuration
*/

var optionsSetup = {
    appId: "com.daniel.nunes.skyshare",
    compression: "maximum",
    icon: "./logo.ico",
    files: [ "**/*", "!.git${/*}", "!.vscode${/*}*", "!build${/*}*", "!.gitignore" ],
    removePackageScripts: true,
    nsis: {
        oneClick: false,
        perMachine: true,
        allowToChangeInstallationDirectory: true,
        installerSidebar: "./installerSidebar.bmp",
        uninstallerSidebar: "./installerSidebar.bmp",
        uninstallDisplayName: "${productName}",
        artifactName: "${productName}-${version}-Setup.${ext}",
        unicode: true,
        runAfterFinish: true,
        createDesktopShortcut: "always",
        createStartMenuShortcut: true,
        menuCategory: false
    },
    asar: true,
    directories: {
        buildResources: "./assets/setup/",
        output: "./build/setup/"
    }
};

var optionsUpdater = {
    appId: "com.daniel.nunes.skyshare",
    compression: "maximum",
    icon: "./logo.ico",
    files: [ "**/*", "!.git${/*}", "!.vscode${/*}*", "!build${/*}*", "!.gitignore" ],
    removePackageScripts: true,
    nsis: {
        oneClick: true,
        perMachine: true,
        allowToChangeInstallationDirectory: false,
        installerSidebar: "./installerSidebar.bmp",
        uninstallerSidebar: "./installerSidebar.bmp",
        uninstallDisplayName: "${productName}",
        artifactName: "${productName}-${version}-Updater.${ext}",
        unicode: true,
        runAfterFinish: true,
        createDesktopShortcut: "always",
        createStartMenuShortcut: true,
        menuCategory: false
    },
    asar: true,
    directories: {
        buildResources: "./assets/setup/",
        output: "./build/updater/"
    }
};

(async () => {
    let package = require("../package.json");

    await builder.build({
        targets: Platform.WINDOWS.createTarget(),
        config: optionsSetup
    });
    console.log("\x1b[32m%s\x1b[0m\x1b[4m%s\x1b[0m%s", "  • ", package.productName + " " + package.version + " Setup", " was successfully created!");
    console.log("\n");

    await builder.build({
        targets: Platform.WINDOWS.createTarget(),
        config: optionsUpdater
    });
    console.log("\x1b[32m%s\x1b[0m\x1b[4m%s\x1b[0m%s", "  • ", package.productName + " " + package.version + " Updater", " was successfully created!");
})();