import { app } from "./app.svelte";
import type { StoreSettings } from "$electron/lib/interfaces/Store.interface";

export const settings = $state<StoreSettings>(app.getSetting("settings") as StoreSettings);

export function resetSettings() {
    app.resetSettings();

    for (const key of Object.keys(settings))
        delete settings[key as keyof StoreSettings];
}
