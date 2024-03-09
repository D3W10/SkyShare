import i18next from "i18next";
import { createI18nStore } from "svelte-i18next";
import { settings } from "./settingsStore";

import en from "../translations/en.json";
import pt from "../translations/pt.json";

i18next.init<typeof en>({
    lng: await new Promise((resolve) => settings.subscribe(($settings) => resolve($settings.language))),
    resources: {
        en: { translation: en },
        pt: { translation: pt }
    }
});

const i18n = createI18nStore(i18next);
export {
    i18n
}