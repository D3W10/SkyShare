import { writable } from "svelte/store";
import { app } from "./appStore";
import type { IStoreSettings } from "$electron/lib/Store.interface";

export const settings = (() => {
    const { subscribe, set, update } = writable<IStoreSettings>({} as IStoreSettings);

    app.subscribe(($app) => set(($app ? $app?.getSetting("settings") : {}) as IStoreSettings));

    return {
        subscribe,
        update: (property: keyof IStoreSettings, value: any) => {
            update((n) => {
                if (n)
                    n[property] = value as never;
    
                return n;
            });

            app.subscribe(($app) => $app?.setSetting(`settings.${property}`, value));
        }
    }
})();