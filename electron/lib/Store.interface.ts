export interface IStore {
    changelog: string | null;
    settings: IStoreSettings;
    account: IStoreAccount;
}

export interface IStoreSettings {
    theme: number;
    language: string;
    nearbyShare: boolean;
    autoUpdate: boolean;
    betaUpdates: boolean;
}

export interface IStoreAccount {
    username: string | null;
    password: string | null;
}