import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
 
import { LANGUAGE } from './CommonDomain'
import { isDevelopmentMode } from '../envUtils'

import en from './locales/en_US.json'
import ko from './locales/ko_KR.json'
import cn from './locales/cn_CH.json'

async function loadLocaleMessages(currentLanguage: string) {
    //console.log("i18next utils loadLocaleMessages: " + currentLanguage);
    let lang = ''
    if (currentLanguage === 'ko-KR') {
        lang = 'ko_KR'
    } else if (currentLanguage === 'en-US') {
        lang = 'en_US'
    } else if (currentLanguage === 'cn-CH') {
        lang = 'cn_CH'
    } else {
        lang = 'en_US'
    }
    // 해당 언어의 message 파일만 import 한다.
    const data = await import(
        // webpackChunkName: "locale-chunk" 
        `./locales/${lang}.json`
    )
    const locales = data.default
    return { [currentLanguage]: locales }
}
 
export let $: any = () => {}
 
export async function init(currentLanguage: string) {
    return i18n
        .use(initReactI18next)
        .init({
            debug: isDevelopmentMode,
            load: 'currentOnly',
            interpolation: {
                escapeValue: true,
                prefix: '{',
                suffix: '}',
            },
            lng: currentLanguage,
            fallbackLng: LANGUAGE.KO,
            //resources: await loadLocaleMessages(currentLanguage)
            resources: {
                en_US:en,
                ko_KR:ko,
                cn_CH:cn,
            },
        })
        .then(t => {
            $ = t
        })
}

export async function changeLang(currentLanguage: string) {
    console.log("i18next utils changeLang: " + currentLanguage);
    return i18n
        .use(initReactI18next)
        .changeLanguage(currentLanguage)
}

/**
 * reload error
export async function reloadLangResource(currentLanguage: string) {
    console.log("i18next utils reloadLangResource: " + currentLanguage);
    return i18n
        .use(initReactI18next)
        .reloadResources({
            resources : await loadLocaleMessages(currentLanguage)
        })
}
 */