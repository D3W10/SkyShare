import { browser } from "$app/environment";
import type * as preload from "$electron/preload";

type Preload = typeof preload;

const noop = new Proxy({}, {
    get: () => () => {}
}) as Preload;

export const app = $state<Preload>(noop);

if (browser && window) {
    for (const key of Object.keys(window.app) as (keyof Preload)[])
        (app as any)[key] = window.app[key];
}

declare global {
    interface Window {
        app: Preload;
    }
}