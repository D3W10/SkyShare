import { writable } from "svelte/store";

export type pages = "home" | "send" | "receive" | "settings" | "login" | "welcome" | "account";

interface IPageStore {
    current: pages;
    subPage: number;
    oldSubPage: number;
}

export const page = (() => {
    var oldSubPage: number = 0;
    const { subscribe, set } = writable<IPageStore>({ current: "home", subPage: 0, oldSubPage: oldSubPage });

    return {
        subscribe,
        set: (page: pages, subPage?: number) => {
            set({ current: page, subPage: subPage ?? 0, oldSubPage });
            oldSubPage = subPage ?? 0;
        }
    }
})();