import { app } from "./app.svelte";
import type { AppInfo } from "$electron/lib/interfaces/AppInfo.interface";

export const info = $state<AppInfo>(app.getAppInfo());