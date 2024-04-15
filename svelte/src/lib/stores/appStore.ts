import { writable } from "svelte/store";
import type * as preload from "$electron/preload";

export const app = (() => {
    const { subscribe, set } = writable<typeof preload>();

    if (typeof window !== "undefined")
        set({ ...window.app });

    return { subscribe };
})();

declare global {
    interface Window {
        app: typeof preload
    }
}