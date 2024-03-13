import { writable } from "svelte/store";

interface IDisableStore {
    d: boolean;
    loading: boolean;
}

export const disable = (() => {
    const { subscribe, set } = writable<IDisableStore>({ d: false, loading: false });

    return {
        subscribe,
        lock: (loading: boolean = true) => set({ d: true, loading}),
        unlock: () => set({ d: false, loading: false })
    }
})();