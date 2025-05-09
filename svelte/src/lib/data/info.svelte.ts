import { app } from "./app.svelte";
import type { AppInfo } from "$electron/lib/interfaces/AppInfo.interface";

const noop = new Proxy({}, {
    get: () => ""
}) as AppInfo;

export const info = $state<AppInfo>(app.getAppInfo() ?? noop);