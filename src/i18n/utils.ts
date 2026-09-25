// src/i18n/utils.ts
import es from './es.json';
import en from './en.json';

type Locale = 'es' | 'en';

const translations: Record<Locale, Record<string, unknown>> = { es, en };

export function t(locale: string, key: string): string {
  const lang = (locale in translations ? locale : 'es') as Locale;
  const keys = key.split('.');
  let current: unknown = translations[lang];
  for (const k of keys) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[k];
    } else {
      return key; // fallback: retornar la clave si no existe
    }
  }
  return typeof current === 'string' ? current : key;
}

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  return (lang in translations ? lang : 'es') as Locale;
}
