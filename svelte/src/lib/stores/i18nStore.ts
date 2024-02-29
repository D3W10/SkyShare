import i18next from "i18next";
import { createI18nStore } from "svelte-i18next";

import en from "../translations/en.json";
import pt from "../translations/pt.json";

i18next.init<typeof en>({
    lng: "en",
    resources: {
        en: { translation: en },
        pt: { translation: pt }
    }
});

const i18n = createI18nStore(i18next);
export {
    i18n
}