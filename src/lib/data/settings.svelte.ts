import { app } from "./app.svelte";
import { defaultStore } from "$electron/lib/constants/defaultStore.const";
import type { StoreSettings } from "$electron/lib/interfaces/Store.interface";

export const settings = $state<StoreSettings>(app.getSetting("settings") ?? defaultStore.settings);

export function resetSettings() {
    app.resetSettings();

    for (const key of Object.keys(settings))
        delete settings[key as keyof StoreSettings];

    const newSettings = app.getSetting("settings");

    for (const key of Object.keys(newSettings))
        (settings as any)[key] = newSettings[key as keyof StoreSettings];
}