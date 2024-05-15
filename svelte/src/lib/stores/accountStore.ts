import { writable } from "svelte/store";
import { app } from "./appStore";

interface IAccountStore {
    loggedIn: boolean;
    username: string;
    password: string;
    photo?: string;
    recoveryToken?: string;
}

export const account = (() => {
    const { subscribe, set } = writable<IAccountStore>({ loggedIn: false } as IAccountStore);

    return {
        subscribe,
        login: async (username: string, password: string, encrypted: boolean = false) => {
            const $app = await new Promise<typeof import("$electron/preload")>((resolve) => app.subscribe(($app) => resolve($app)));
            const loginAttempt = await $app.account.login(username, password, encrypted);

            if (loginAttempt.success)
                set({ loggedIn: true, ...loginAttempt.data! });

            return loginAttempt.success;
        },
        check: async (username: string, email: string) => {
            const $app = await new Promise<typeof import("$electron/preload")>((resolve) => app.subscribe(($app) => resolve($app)));

            return await $app.account.check(username, email);
        },
        signup: async (username: string, email: string, password: string, photo: string | null) => {
            const $app = await new Promise<typeof import("$electron/preload")>((resolve) => app.subscribe(($app) => resolve($app)));
            const signupAttempt = await $app.account.signup(username, email, password, photo);

            if (signupAttempt.success)
                set({ loggedIn: true, ...signupAttempt.data! });

            return signupAttempt.success;
        },
        request: async (type: "verify" | "recovery", email: string, language: string) => {
            const $app = await new Promise<typeof import("$electron/preload")>((resolve) => app.subscribe(($app) => resolve($app)));
            const req = await $app.account.request(type, email, language);

            if (req.success && type == "recovery")
                set({ loggedIn: false, recoveryToken: "" } as IAccountStore);

            return req;
        },
        recovery: () => {
            set({ loggedIn: false, recoveryToken: undefined } as IAccountStore);
        },
        logout: async () => {
            const $app = await new Promise<typeof import("$electron/preload")>((resolve) => app.subscribe(($app) => resolve($app)));

            $app.account.logout();
            set({ loggedIn: false } as IAccountStore);
        }
    }
})();