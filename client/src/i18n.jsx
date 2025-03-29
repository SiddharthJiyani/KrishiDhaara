import i18n from 'i18next';
import { initReactI18next, useTranslation as useReactTranslation } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18next properly
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    supportedLngs: ['en', 'hi'],
    react: {
      useSuspense: false
    }
  });

// Export the useTranslation hook from react-i18next
export const useTranslation = useReactTranslation;

export default i18n;