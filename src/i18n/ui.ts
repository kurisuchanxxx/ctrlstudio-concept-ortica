// Every interface string in one place. Editorial content (game copy,
// manifesto, descriptions) lives in src/content instead.
// To add a language: add a locale to astro.config.mjs i18n, a dictionary
// here with the same keys, and localized content files.

export const defaultLocale = 'en' as const;

export const ui = {
  en: {
    'site.name': 'Studio Ortica',
    'site.titleSuffix': 'Studio Ortica',
    'site.homeTitle': 'Studio Ortica · Short horror games from Turin',

    'a11y.skip': 'Skip to content',
    'a11y.home': 'Studio Ortica, home',
    'a11y.mainNav': 'Main',
    'a11y.external': '(opens in a new tab)',

    'nav.games': 'Games',
    'nav.press': 'Press',
    'nav.contact': 'Contact',

    'concept.notice': 'Concept notice',
    'concept.footer':
      'This website is a concept designed by Ctrl Studio for Studio Ortica. It is not affiliated with or endorsed by Studio Ortica.',

    'cta.buySteam': 'Buy on Steam',
    'cta.wishlistSteam': 'Wishlist on Steam',
    'cta.watchTrailer': 'Watch trailer',
    'cta.aboutGame': 'About the game',
    'cta.store': '{store}',
    'cta.pressKit': 'Press kit',
    'cta.allGames': 'All games',

    'state.released': 'Out now',
    'state.upcoming': 'Coming {date}',
    'state.upcomingUndated': 'Coming soon',
    'state.unannounced': 'Date to be confirmed',

    'game.entry': 'Entry {n}',
    'game.sitting': 'One sitting',

    'pending.label': 'Pending',
    'pending.link': 'Link pending',
    'pending.quote': 'Press quote',
    'pending.quoteNote': 'Reserved for a verified quote with its source',
    'pending.image': 'Image pending',

    'slot.keyArt': 'Key art',
    'slot.card': 'Capsule art',
    'slot.screenshot': 'Screenshot {n}',
    'slot.trailerFrame': 'Trailer frame',
    'slot.logo': 'Logo',
    'slot.teamPhoto': 'Team photo',

    'home.hero.studioLine': 'Independent studio · {city} · Since {year}',
    'home.manifesto': 'Manifesto',
    'home.games': 'Games',
    'home.recognition': 'Recognition & press',
    'home.awards': 'Awards',
    'home.press': 'Press',
    'home.contact': 'Contact',
    'home.contact.text': 'For press and business enquiries, write to the studio directly.',

    'facts.title': 'At a glance',
    'facts.duration': 'Duration',
    'facts.price': 'Price',
    'facts.platforms': 'Platforms',
    'facts.release': 'Release',
    'facts.languages': 'Languages',
    'facts.publisher': 'Console publisher',
    'facts.developer': 'Developer',
    'facts.recognition': 'Recognition',
    'facts.basedIn': 'Based in',
    'facts.founded': 'Founded',
    'facts.team': 'Team',
    'facts.roles': 'Roles',
    'facts.engine': 'Engine',
    'facts.pressContact': 'Press contact',
    'facts.businessContact': 'Business contact',
    'facts.channels': 'Channels',
    'facts.website': 'Game page',
    'facts.steam': 'Steam page',
    'facts.tba': 'Date to be confirmed',

    'trailer.title': 'Trailer',
    'trailer.play': 'Play trailer',
    'trailer.iframeTitle': '{title} trailer',
    'trailer.pending': 'Trailer link pending',
    'trailer.close': 'Close trailer',
    'trailer.privacy': 'Plays from YouTube (privacy-enhanced mode) when you press play.',

    'gallery.title': 'Screenshots',
    'gallery.open': 'Open screenshot {n} of {total}',
    'gallery.alt': '{title}, screenshot {n}',
    'gallery.viewer': 'Screenshot viewer',
    'gallery.prev': 'Previous screenshot',
    'gallery.next': 'Next screenshot',
    'gallery.close': 'Close',
    'gallery.count': '{n} / {total}',

    'game.description': 'About',
    'game.contentWarning': 'Content warning',
    'game.pressKit': 'Press kit for {title}',
    'game.pressKitText': 'Fact sheet, descriptions, logos and screenshots for coverage.',
    'game.more': 'More from Studio Ortica',

    'press.title': 'Press kit',
    'press.intro':
      'Everything you need to write about Studio Ortica and its games. For anything missing, write to the press contact.',
    'press.factsheet': 'Fact sheet',
    'press.description': 'Description',
    'press.history': 'History',
    'press.games': 'Games',
    'press.logos': 'Logos & photos',
    'press.download': 'Download press kit (.zip)',
    'press.downloadPending': 'Press kit .zip pending',
    'press.downloadOriginal': 'Download original',
    'press.shortDescription': 'Short description',
    'press.longDescription': 'Long description',
    'press.images': 'Images',
    'press.videos': 'Video',
    'press.credits': 'Team',
    'press.contact': 'Contact',
    'press.awards': 'Recognition',
    'press.quotes': 'Selected press',
    'press.backToKit': 'Studio press kit',
    'press.factsheetGame': 'Fact sheet',

    'footer.follow': 'Follow',
    'footer.press': 'Press',
    'footer.business': 'Business',
    'footer.publisher': 'Console publisher',
    'footer.pressKit': 'Press kit',
    'footer.rights': '© {year} Studio Ortica',

    'notFound.title': 'Nothing here',
    'notFound.text': 'This page does not exist, or it has gone quiet.',
    'notFound.back': 'Back to the home page',
  },
} as const;

export type Locale = keyof typeof ui;
export type UiKey = keyof (typeof ui)[typeof defaultLocale];
