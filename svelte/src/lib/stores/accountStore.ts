import { writable } from "svelte/store";
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
            const $app = await new Promise<typeof import("$electron/preload")>(resolve => app.subscribe($app => resolve($app)));
            const loginAttempt = await $app.account.login(username, password, encrypted);

            if (loginAttempt.success)
                set({ loggedIn: true, startup: encrypted, ...loginAttempt.data! });

            return loginAttempt.success;
        },
        check: async (username: string, email: string) => {
            const $app = await new Promise<typeof import("$electron/preload")>(resolve => app.subscribe($app => resolve($app)));

            return await $app.account.check(username, email);
        },
        signup: async (username: string, email: string, password: string, photo: string | null) => {
            const $app = await new Promise<typeof import("$electron/preload")>(resolve => app.subscribe($app => resolve($app)));
            const signupAttempt = await $app.account.signup(username, email, password, photo);

            if (signupAttempt.success)
                set({ loggedIn: true, startup: false, ...signupAttempt.data! });

            return signupAttempt.success;
        },
        edit: async (username: string | undefined, email: string | undefined, photo: string | null | undefined) => {
            const $app = await new Promise<typeof import("$electron/preload")>(resolve => app.subscribe($app => resolve($app)));
            const $account = await new Promise<IAccountStore>(resolve => account.subscribe($account => resolve($account)));
            const req = await $app.account.edit($account.username, $account.password, username, email, photo);

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
            const $app = await new Promise<typeof import("$electron/preload")>(resolve => app.subscribe($app => resolve($app)));
            const req = await $app.account.request(type, email, language);

            if (req.success && type == "recovery")
                update(n => { n.recoveryToken = ""; return n; });

            return req;
        },
        setRecoveryToken: (token: string) => update(n => { n.recoveryToken = token; return n; }),
        recovery: async (email: string, password: string) => {
            const $app = await new Promise<typeof import("$electron/preload")>(resolve => app.subscribe($app => resolve($app)));
            const $account = await new Promise<IAccountStore>(resolve => account.subscribe($account => resolve($account)));
            const req = await $app.account.recovery(email, password, $account.recoveryToken!);

            if (req.success)
                update(n => { n.recoveryToken = undefined; return n; });

            return req;
        },
        logout: async () => {
            const $app = await new Promise<typeof import("$electron/preload")>(resolve => app.subscribe($app => resolve($app)));

            $app.account.logout();
            set({ loggedIn: false } as IAccountStore);
        }
    }
})();