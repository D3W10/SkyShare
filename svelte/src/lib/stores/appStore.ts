import { writable } from "svelte/store";
import type * as preload from "$electron/preload";

export const app = (() => {
    const { subscribe, set } = writable<typeof preload | null>(null);

    if (typeof window !== "undefined")
        set({ ...window.app });

    return { subscribe };
})();

declare global {
    interface Window {
        app: typeof preload
    }
}