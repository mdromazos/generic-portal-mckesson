import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import translationEN from "./locales/translation_en";
import translationDE from "./locales/translation_de";
import translationES from "./locales/translation_es";
import translationFR from "./locales/translation_fr";
import translationJA from "./locales/translation_ja";
import translationKO from "./locales/translation_ko";
import translationPT_BR from "./locales/translation_pt_BR";
import translationRU from "./locales/translation_ru";
import translationZH_CN from "./locales/translation_zh_CN";

const resources = {
    en: {
        translations: translationEN
    },
    de: {
        translations: translationDE
    },
    es: {
        translations: translationES
    },
    fr: {
        translations: translationFR
    },
    ja: {
        translations: translationJA
    },
    ko: {
        translations: translationKO
    },
    pt_BR: {
        translations: translationPT_BR
    },
    ru: {
        translations: translationRU
    },
    zh_CN: {
        translations: translationZH_CN
    }
};
i18n.use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: "en",
        // have a common namespace used around the full app
        ns: ["translations"],
        defaultNS: "translations",
        keySeparator: true, // we do not use keys in form messages.welcome
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });
export default i18n;
