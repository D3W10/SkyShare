import { writable } from "svelte/store";
import { app } from "./appStore";

interface IAccountStore {
    username: string;
    password: string;
    photo?: string;
}

export const account = (() => {
    const { subscribe, set } = writable<IAccountStore | undefined>();

    return {
        subscribe,
        login: async (username: string, password: string, encrypted: boolean = false) => {
            const $app = await new Promise<typeof import("$electron/preload")>((resolve) => app.subscribe(($app) => resolve($app!)));
            const loginAttempt = await $app.account.login(username, password, encrypted);

            if (loginAttempt.success)
                set(loginAttempt.data!);

            return loginAttempt.success;
        },
        check: async (username: string) => {
            const $app = await new Promise<typeof import("$electron/preload")>((resolve) => app.subscribe(($app) => resolve($app!)));

            return await $app.account.check(username);
        },
        logout: async () => {
            const $app = await new Promise<typeof import("$electron/preload")>((resolve) => app.subscribe(($app) => resolve($app!)));

            $app.account.logout();
            set(undefined);
        }
    }
})();