import { derived } from "svelte/store";
import { app } from "./appStore";
import type { AppInfo } from "$electron/preload";

export const info = derived(app, ($app) => ($app ? $app.getAppInfo() : {}) as AppInfo);