import { IStore } from "../interfaces/Store.interface";

export const defaultStore = {
    changelog: null,
    updateTo: "",
    settings: {
        theme: "light",
        language: "en-US",
        sidebarCollapsed: false,
        nearbyShare: true,
        autoUpdate: true,
        betaUpdates: false
    },
    account: {
        username: null,
        password: null
    }
} satisfies IStore;