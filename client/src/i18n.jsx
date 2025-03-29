import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18next properly
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next) // <- This is crucial
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Update path if needed
    },
    supportedLngs: ['en', 'hi'],
    react: {
      useSuspense: false
    }
  });

export default i18n;