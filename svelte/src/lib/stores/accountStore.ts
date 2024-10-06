import { get, writable } from "svelte/store";
import { app } from "./appStore";
import { settings } from "./settingsStore";

interface IAccountStore extends IAccountStoreData {
    loggedIn: boolean;
    startup: boolean;
    recoveryToken?: string;
}

interface IAccountStoreData {
    username: string;
    password: string;
    email: string;
    photo?: string;
    createdAt: Date;
    emailVerified: boolean;
    settings: {
        historyEnabled: boolean;
        showInfo: boolean;
    }
}

interface IHistoryEntry {
    type: 0 | 1;
    address: string;
    message: string;
    date: Date;
}

export const account = (() => {
    const { subscribe, set, update } = writable<IAccountStore>({ loggedIn: false, startup: true } as IAccountStore);

    return {
        subscribe,
        login: async (username: string, password: string, encrypted: boolean = false) => {
            const loginAttempt = await get(app).account.login<IAccountStoreData>(username, password, encrypted);

            if (loginAttempt.success)
                set({ loggedIn: true, startup: encrypted, ...loginAttempt.data! });

            return loginAttempt.success;
        },
        check: async (username: string, email: string) => {
            return await get(app).account.check<{ username: string, email: string }>(username, email);
        },
        signup: async (username: string, email: string, password: string, photo: string | null) => {
            const signupAttempt = await get(app).account.signup<IAccountStoreData>(username, email, password, photo, get(settings).language);

            if (signupAttempt.success)
                set({ loggedIn: true, startup: false, ...signupAttempt.data! });

            return signupAttempt.success;
        },
        edit: async (username: string | undefined, email: string | undefined, photo: string | null | undefined) => {
            const acc = get(account);
            const req = await get(app).account.edit<IAccountStoreData>(acc.username, acc.password, username, email, photo, get(settings).language);

            if (req.success && req.data)
                set({ loggedIn: true, startup: false, ...req.data });

            return req;
        },
        password: async (newPassword: string) => {
            const acc = get(account);
            const req = await get(app).account.password<IAccountStoreData>(acc.username, acc.password, newPassword);

            if (req.success && req.data)
                set({ loggedIn: true, startup: false, ...req.data });

            return req;
        },
        request: async (type: "verify" | "recovery", email: string) => {
            const req = await get(app).account.request(type, email, get(settings).language);

            if (req.success && type == "recovery")
                update(n => {
                    n.recoveryToken = "";
                    return n;
                });

            return req;
        },
        verify: async (email: string, verificationToken: string) => await get(app).account.verify(email, verificationToken),
        setRecoveryToken: (token: string) => update(n => {
            n.recoveryToken = token;
            return n;
        }),
        recovery: async (email: string, password: string) => {
            const req = await get(app).account.recovery(email, password, get(account).recoveryToken!);

            if (req.success)
                update(n => {
                    n.recoveryToken = undefined;
                    return n;
                });

            return req;
        },
        history: {
            get: async () => {
                const acc = get(account);
                const req = await get(app).account.history.get<IHistoryEntry[]>(acc.username, acc.password);

                return req.success && req.data ? req.data : [];
            },
            clear: async () => {
                const acc = get(account);
                const req = await get(app).account.history.clear(acc.username, acc.password);

                return req.success;
            }
        },
        settings: async (historyEnabled: boolean, showInfo: boolean) => {
            const req = await get(app).account.settings<IAccountStoreData>(get(account).username, get(account).password, historyEnabled, showInfo);

            if (req.success && req.data)
                update(n => {
                    n.settings.historyEnabled = req.data!.settings.historyEnabled;
                    n.settings.showInfo = req.data!.settings.showInfo;
                    return n;
                });

            return req;
        },
        logout: async () => {
            get(app).account.logout();
            set({ loggedIn: false } as IAccountStore);
        },
        delete: async (password: string) => {
            const req = await get(app).account.delete(get(account).username, password);

            if (req.success)
                set({ loggedIn: false } as IAccountStore);

            return req;
        }
    }
})();