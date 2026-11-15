// English texts. This file is the source of truth: every key here must also
// exist in tr.ts (TypeScript reports an error if one is missing).
// Placeholders like {count} are filled in by t('key', { count: 3 }).

export const en = {
  // Navigation & layout
  'nav.howItWorks': 'How it works',
  'nav.features': 'Features',
  'nav.airlines': 'Airlines',
  'nav.faq': 'FAQ',
  'nav.main': 'Main',
  'nav.mobile': 'Mobile',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.logIn': 'Log in',
  'nav.signUp': 'Sign up free',
  'nav.dashboard': 'Dashboard',
  'nav.logOut': 'Log out',
  'nav.home': 'FlyAlert home',

  // Language & currency selector
  'prefs.button': 'Language and currency',
  'prefs.title': 'Language & currency',
  'prefs.language': 'Language',
  'prefs.currency': 'Currency',
  'prefs.note': 'Saved to your account when you are logged in.',

  // Footer
  'footer.tagline': 'Track flight prices worldwide and get notified when they drop to your target price.',
  'footer.product': 'Product',
  'footer.account': 'Account',
  'footer.signUp': 'Sign up',
  'footer.rights': '© {year} FlyAlert. All rights reserved.',
  'footer.noTickets': "FlyAlert doesn't sell tickets. You always book with the airline or provider.",

  // Hero
  'hero.badge': 'Flight price tracking, made simple',
  'hero.title1': 'Stop checking prices.',
  'hero.title2': 'Let them come to you.',
  'hero.subtitle':
    'Track any route worldwide, set your target price, and get notified the moment fares drop. Then book directly with the airline or provider.',
  'hero.point1': '100% free, no paid plans',
  'hero.point2': 'No credit card required',
  'hero.point3': 'Pause or delete alerts anytime',

  // Example alert card (illustration)
  'example.label': 'Price alert',
  'example.details': 'Round-trip · 1 adult · Economy',
  'example.active': 'Active',
  'example.current': 'Current price',
  'example.target': 'Your target',
  'example.notified': 'Price dropped below your target. We notified you.',
  'example.disclaimer': 'Illustrative example — not real flight data',

  // How it works
  'how.eyebrow': 'How it works',
  'how.title': 'From search to savings in four steps',
  'how.subtitle': "Set it up once. FlyAlert keeps watching so you don't have to.",
  'how.step1.title': 'Search your route',
  'how.step1.text': 'Pick your departure and destination airports, travel dates and passengers.',
  'how.step2.title': 'Set a target price',
  'how.step2.text': 'Choose the trip you like and tell us the price you would be happy to pay.',
  'how.step3.title': 'We monitor fares',
  'how.step3.text': 'FlyAlert checks prices on a regular schedule and records every change.',
  'how.step4.title': 'Get alerted & book',
  'how.step4.text': 'When the price hits your target, we notify you with a link to book.',

  // Features
  'features.eyebrow': 'Features',
  'features.title': 'Everything you need to catch a better fare',
  'features.subtitle': 'Simple tools that do one job well: helping you pay less for flights.',
  'features.alerts.title': 'Target price alerts',
  'features.alerts.text': 'Get notified in the app as soon as a fare drops to your target. Email alerts are coming soon.',
  'features.history.title': 'Price history charts',
  'features.history.text': 'See how a fare has moved over time, based only on prices we actually recorded.',
  'features.routes.title': 'Routes worldwide',
  'features.routes.text': 'Search flights between airports and cities around the world, one-way or round-trip.',
  'features.currency.title': 'Your language & currency',
  'features.currency.text': 'Use FlyAlert in English or Turkish and see prices in the currency you prefer.',
  'features.noSpam.title': 'No notification spam',
  'features.noSpam.text': "We won't alert you twice for the same price. Only changes that matter.",
  'features.book.title': 'Book with the source',
  'features.book.text': 'We never sell tickets. You book directly with the airline or booking provider.',

  // Airlines
  'airlines.eyebrow': 'Airlines',
  'airlines.title': 'Fares from airlines around the world',
  'airlines.subtitle':
    'Full-service and low-cost carriers, on routes across Europe, the Middle East, Asia and the Americas.',
  'airlines.more': 'and many more',
  'airlines.note':
    'FlyAlert shows the cheapest fares travelers have recently found for each route and date, so the airlines you see depend on the route.',

  // FAQ
  'faq.eyebrow': 'FAQ',
  'faq.title': 'Frequently asked questions',
  'faq.q1': 'Does FlyAlert sell flight tickets?',
  'faq.a1':
    'No. FlyAlert is a price tracking tool. When you find a fare you like, we send you to the airline or booking provider to complete your purchase.',
  'faq.q2': 'Is FlyAlert free?',
  'faq.a2':
    'Yes, completely. There are no paid plans and no credit card is needed. FlyAlert is funded by small commissions from booking sites when you book through our links, and possibly by a few clearly marked ads. Neither changes the price you pay.',
  'faq.q3': 'How often are prices checked?',
  'faq.a3':
    'We check the prices of your tracked trips on a regular schedule and save each result, so you can see how the fare changes over time.',
  'faq.q4': 'Can FlyAlert predict future flight prices?',
  'faq.a4':
    'No. We show you prices we have actually recorded and notify you when they drop. We never claim to know what a fare will cost in the future.',
  'faq.q5': 'Will I get spammed with notifications?',
  'faq.a5': 'No. You are notified when a fare reaches your target, and we avoid sending repeated alerts for the same price.',
  'faq.q6': 'Which languages and currencies are supported?',
  'faq.a6':
    'FlyAlert is available in English and Turkish. You can choose from eleven currencies, including USD, EUR, GBP, TRY and AZN, using the selector at the top of the page.',

  // Call to action
  'cta.title': 'Ready to catch your next price drop?',
  'cta.subtitle': 'Create a free account and set up your first flight alert in under a minute.',
  'cta.button': 'Sign up free',

  // Search form
  'search.formLabel': 'Flight search',
  'search.tripType': 'Trip type',
  'search.roundTrip': 'Round-trip',
  'search.oneWay': 'One-way',
  'search.passengers': 'Passengers',
  'search.passengerCount': '{count} passenger',
  'search.passengerCountPlural': '{count} passengers',
  'search.economy': 'Economy fares',
  'search.from': 'From',
  'search.to': 'To',
  'search.departure': 'Departure',
  'search.return': 'Return',
  'search.swap': 'Swap origin and destination',
  'search.submit': 'Search',
  'search.placeholder': 'City or airport',
  'search.noAirports': 'No airports found',
  'search.suggestions': '{label} suggestions',
  'search.allAirports': 'All airports in {city}',
  'search.allAirportsShort': 'all airports',
  'search.error.origin': 'Choose a departure airport from the list.',
  'search.error.destination': 'Choose a destination airport from the list.',
  'search.error.sameAirport': 'Destination must be different from departure.',
  'search.error.departureMissing': 'Choose a departure date.',
  'search.error.invalidDate': 'Enter a valid date.',
  'search.error.pastDate': 'Date cannot be in the past.',
  'search.error.returnMissing': 'Choose a return date.',
  'search.error.returnBeforeDeparture': 'Return must be on or after departure.',
  'search.error.passengers': 'Choose between 1 and {max} passengers.',
} as const

export type MessageKey = keyof typeof en
