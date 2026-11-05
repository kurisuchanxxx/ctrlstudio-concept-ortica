import { defaultLocale, ui, type Locale, type UiKey } from './ui';

export { defaultLocale, type Locale, type UiKey };

function isLocale(value: string | undefined): value is Locale {
  return !!value && value in ui;
}

/** Usage in a component: const t = useTranslations(Astro.currentLocale). */
export function useTranslations(locale?: string) {
  const dict = ui[isLocale(locale) ? locale : defaultLocale];
  return (key: UiKey, vars: Record<string, string | number> = {}): string =>
    dict[key].replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

const INTL: Record<Locale, string> = { en: 'en-GB' };

/** BCP 47 tag for Intl formatting (dates). */
export function intlLocale(locale?: string): string {
  return INTL[isLocale(locale) ? locale : defaultLocale];
}
