/// <reference types="svelte" />

import type * as preload from "$electron/preload";

declare global {
    interface Window {
        app: typeof preload;
        goto: (url: string) => Promise<unknown>;
    }
}