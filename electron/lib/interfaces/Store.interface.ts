export interface IStore {
    changelog: string | null;
    settings: StoreSettings;
    account: StoreAccount;
}

export interface StoreSettings {
    theme: "light" | "dark";
    language: string;
    nearbyShare: boolean;
    autoUpdate: boolean;
    betaUpdates: boolean;
}

export interface StoreAccount {
    username: string | null;
    password: string | null;
}