/**
 * @type {import("electron-builder").Configuration)}
 */
module.exports = {
    appId: "com.d3w10.cosmochamp",
    compression: "maximum",
    directories: {
        output: "out"
    },
    files: [
        "**/dist/**",
        "**/LICENSE",
        "**/package.json",
        "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
        "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
        "!**/node_modules/*.d.ts",
        "!**/node_modules/.bin",
        "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
        "!.editorconfig",
        "!**/._*",
        "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
        "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
        "!**/{appveyor.yml,.travis.yml,circle.yml}",
        "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
    ],
    publish: [
        {
            provider: "github",
            owner: "D3W10",
            repo: "CosmoChamp"
        }
    ],
    win: {
        target: [
            "nsis"
        ],
        icon: "./icon.ico"
    },
    nsis: {
        oneClick: false,
        perMachine: false,
        selectPerMachineByDefault: true,
        allowToChangeInstallationDirectory: true,
        installerIcon: "./icon.ico",
        installerSidebar: "./installerSidebar.bmp",
        uninstallerIcon: "./icon.ico",
        uninstallerSidebar: "./uninstallerSidebar.bmp",
        uninstallDisplayName: "${productName}",
        license: "LICENSE",
        deleteAppDataOnUninstall: true
    },
    mac: {
        target: {
            target: "default",
            arch: [
                "arm64",
                "x64"
            ]
        },
        icon: "../svelte/static/logo.png",
        type: "distribution",
        hardenedRuntime: false
    },
    dmg: {
        contents: [
            {
                x: 190,
                y: 175
            },
            {
                x: 365,
                y: 175,
                type: "link",
                path: "/Applications"
            }
        ]
    }
};