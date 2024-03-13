import { writable } from "svelte/store";
import { app } from "./appStore";

interface IAccountStore {
    username: string;
}

export const account = (() => {
    const { subscribe, set } = writable<IAccountStore | undefined>();

    return {
        subscribe,
        login: async (username: string, password: string) => {
            const $app = await new Promise<typeof import("$electron/preload")>((resolve) => app.subscribe(($app) => resolve($app!)));

            if (await $app.account.login(username, password)) {
                set({ username });

                return true;
            }

            return false;
        }
    }
})();