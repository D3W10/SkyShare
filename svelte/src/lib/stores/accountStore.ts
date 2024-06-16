import { get, writable } from "svelte/store";
import { app } from "./appStore";

interface IAccountStore {
    loggedIn: boolean;
    startup: boolean;
    username: string;
    password: string;
    email: string;
    photo?: string;
    createdAt: Date;
    recoveryToken?: string;
}

export const account = (() => {
    const { subscribe, set, update } = writable<IAccountStore>({ loggedIn: false, startup: true } as IAccountStore);

    return {
        subscribe,
        login: async (username: string, password: string, encrypted: boolean = false) => {
            const loginAttempt = await get(app).account.login(username, password, encrypted);

            if (loginAttempt.success)
                set({ loggedIn: true, startup: encrypted, ...loginAttempt.data! });

            return loginAttempt.success;
        },
        check: async (username: string, email: string) => {
            return await get(app).account.check(username, email);
        },
        signup: async (username: string, email: string, password: string, photo: string | null) => {
            const signupAttempt = await get(app).account.signup(username, email, password, photo);

            if (signupAttempt.success)
                set({ loggedIn: true, startup: false, ...signupAttempt.data! });

            return signupAttempt.success;
        },
        edit: async (username: string | undefined, email: string | undefined, photo: string | null | undefined) => {
            const acc = get(account);
            const req = await get(app).account.edit(acc.username, acc.password, username, email, photo);

            if (req.success)
                update(n => {
                    n.startup = false;
                    n.username = req.data?.username!;
                    n.email = req.data?.email!;
                    n.photo = req.data?.photo!;
                    n.createdAt = req.data?.createdAt!;
                    return n;
                });

            return req;
        },
        request: async (type: "verify" | "recovery", email: string, language: string) => {
            const req = await get(app).account.request(type, email, language);

            if (req.success && type == "recovery")
                update(n => { n.recoveryToken = ""; return n; });

            return req;
        },
        setRecoveryToken: (token: string) => update(n => { n.recoveryToken = token; return n; }),
        recovery: async (email: string, password: string) => {
            const req = await get(app).account.recovery(email, password, get(account).recoveryToken!);

            if (req.success)
                update(n => { n.recoveryToken = undefined; return n; });

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