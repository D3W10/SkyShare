import { writable } from "svelte/store";

export const disable = (() => {
    const { subscribe, set } = writable<boolean>(false);

    return {
        subscribe,
        lock: () => set(true),
        unlock: () => set(false)
    }
})();