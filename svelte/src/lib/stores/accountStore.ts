import { writable } from "svelte/store";
import { app } from "./appStore";

interface IAccountStore {
    username: string;
}

export const account = (() => {
    const { subscribe, set } = writable<IAccountStore | undefined>();

    return {
        subscribe,
        login: async (username: string, password: string, encrypted: boolean = false) => {
            const $app = await new Promise<typeof import("$electron/preload")>((resolve) => app.subscribe(($app) => resolve($app!)));

            if (await $app.account.login(username, password, encrypted)) {
                set({ username });

                return true;
            }

            return false;
        },
        logout: async () => {
            const $app = await new Promise<typeof import("$electron/preload")>((resolve) => app.subscribe(($app) => resolve($app!)));

            $app.account.logout();
            set(undefined);
        }
    }
})();