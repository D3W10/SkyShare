export interface IStore {
    changelog: string | null;
    updateTo: string;
    settings: StoreSettings;
    account: StoreAccount;
}

export interface StoreSettings {
    theme: "light" | "dark";
    language: string;
    sidebarCollapsed: boolean;
    nearbyShare: boolean;
    autoUpdate: boolean;
    betaUpdates: boolean;
}

export interface StoreAccount {
    refreshToken?: string;
}