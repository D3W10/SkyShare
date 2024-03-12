import i18next, { type i18n as i18nT } from "i18next";
import { createI18nStore } from "svelte-i18next";
import { settings } from "./settingsStore";

import en from "../translations/en.json";
import pt from "../translations/pt.json";
import type { Writable } from "svelte/store";

let i18n: Writable<i18nT>;

(async () => {
    i18next.init<typeof en>({
        lng: await new Promise((resolve) => settings.subscribe(($settings) => resolve($settings.language))),
        resources: {
            en: { translation: en },
            pt: { translation: pt }
        }
    });

    i18n = createI18nStore(i18next);
})();

export {
    i18n
}