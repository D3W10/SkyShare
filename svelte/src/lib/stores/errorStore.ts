import { writable } from "svelte/store";
import type { ModalError } from "$lib/models/ModalError.type";

interface IErrorStore {
    type: ModalError | null;
    show: boolean;
    vars?: { [key: string]: string };
}

export const error = (() => {
    const { subscribe, set } = writable<IErrorStore>({ type: null, show: false });

    return {
        subscribe,
        set: (type: ModalError, vars?: { [key: string]: any }) => set({ type, show: true, vars }),
        hide: () => set({ type: null, show: false })
    }
})();