import type * as preload from "$electron/preload";

type Preload = typeof preload;

export const app = $state<Preload>(window.app);

declare global {
    interface Window {
        app: Preload
    }
}