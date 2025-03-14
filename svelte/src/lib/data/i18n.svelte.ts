import i18next, { type TFunction } from "i18next";

import enUS from "../translations/en-US.json";
import ptPT from "../translations/pt-PT.json";

await i18next.init({
    lng: "en-US",
    resources: {
        "en-US": { translation: enUS },
        "pt-PT": { translation: ptPT }
    }
});

export const i18n = $state({
    t: i18next.t,
    language: i18next.language
});

export function changeLanguage(lng: string) {
    i18next.language = lng;
    i18next.changeLanguage(lng).then(t => i18n.t = (k => t(k)) as TFunction<["translation", ...string[]], undefined>);
}