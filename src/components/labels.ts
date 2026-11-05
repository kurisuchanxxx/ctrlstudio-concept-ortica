// Shared label helpers for components.
import { intlLocale, useTranslations } from '~/i18n';
import { formatPartialDate, type Game, type PlatformRelease } from '~/lib/content';

type T = ReturnType<typeof useTranslations>;

export function entryLabel(t: T, game: Game): string {
  return t('game.entry', { n: String(game.entry).padStart(2, '0') });
}

export function stateLabel(t: T, game: Game, locale?: string): string {
  if (game.state === 'released') return t('state.released');
  if (game.state === 'upcoming') {
    const next = game.platforms
      .filter((p) => p.state === 'upcoming' && p.date)
      .sort((a, b) => a.date!.start.getTime() - b.date!.start.getTime())[0];
    return next?.date
      ? t('state.upcoming', { date: formatPartialDate(next.date, intlLocale(locale)) })
      : t('state.upcomingUndated');
  }
  return t('state.unannounced');
}

export function platformDate(t: T, p: PlatformRelease, locale?: string): string {
  return p.date ? formatPartialDate(p.date, intlLocale(locale)) : t('facts.tba');
}
