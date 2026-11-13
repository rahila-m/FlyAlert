import type { Airport } from './model'

// A static list of major airports used for autocomplete during UI development.
// It is NOT a complete list. In Phase 4 we will search airports through the
// flight data API instead, so any airport in the world can be found.
export const AIRPORTS: Airport[] = [
  // Türkiye
  { iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Türkiye' },
  { iata: 'SAW', name: 'Sabiha Gökçen International Airport', city: 'Istanbul', country: 'Türkiye' },
  { iata: 'ESB', name: 'Esenboğa International Airport', city: 'Ankara', country: 'Türkiye' },
  { iata: 'ADB', name: 'Adnan Menderes Airport', city: 'Izmir', country: 'Türkiye' },
  { iata: 'AYT', name: 'Antalya Airport', city: 'Antalya', country: 'Türkiye' },
  // Europe
  { iata: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { iata: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom' },
  { iata: 'STN', name: 'Stansted Airport', city: 'London', country: 'United Kingdom' },
  { iata: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { iata: 'ORY', name: 'Orly Airport', city: 'Paris', country: 'France' },
  { iata: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { iata: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
  { iata: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany' },
  { iata: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain' },
  { iata: 'BCN', name: 'Barcelona–El Prat Airport', city: 'Barcelona', country: 'Spain' },
  { iata: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome', country: 'Italy' },
  { iata: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy' },
  { iata: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
  { iata: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria' },
  { iata: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
  { iata: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden' },
  { iata: 'OSL', name: 'Oslo Airport, Gardermoen', city: 'Oslo', country: 'Norway' },
  { iata: 'HEL', name: 'Helsinki Airport', city: 'Helsinki', country: 'Finland' },
  { iata: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland' },
  { iata: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal' },
  { iata: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece' },
  { iata: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland' },
  { iata: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czechia' },
  { iata: 'BUD', name: 'Budapest Ferenc Liszt International Airport', city: 'Budapest', country: 'Hungary' },
  // Middle East & Africa
  { iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
  { iata: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates' },
  { iata: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar' },
  { iata: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
  { iata: 'JNB', name: 'O. R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa' },
  { iata: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa' },
  { iata: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya' },
  // Americas
  { iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
  { iata: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'United States' },
  { iata: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States' },
  { iata: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States' },
  { iata: 'ATL', name: 'Hartsfield–Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States' },
  { iata: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States' },
  { iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
  { iata: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States' },
  { iata: 'SEA', name: 'Seattle–Tacoma International Airport', city: 'Seattle', country: 'United States' },
  { iata: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada' },
  { iata: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada' },
  { iata: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico' },
  { iata: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' },
  { iata: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina' },
  { iata: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' },
  // Asia & Oceania
  { iata: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
  { iata: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
  { iata: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' },
  { iata: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China' },
  { iata: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China' },
  { iata: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong' },
  { iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
  { iata: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { iata: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
  { iata: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India' },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
  { iata: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
  { iata: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },
  { iata: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand' },
]

// Lowercase and remove accents so "istanbul" matches "İstanbul" and "sao" matches "São".
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

// Places the user picked from live suggestions are remembered for this browser
// session, so the search page can show "London" instead of just "LON".
const STORAGE_KEY = 'flyalert:places'
const remembered = new Map<string, Airport>()

function loadRemembered() {
  if (remembered.size > 0) return
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]') as Airport[]
    for (const place of stored) remembered.set(place.iata, place)
  } catch {
    // Storage can be unavailable (private mode, tests); names then fall back to codes.
  }
}

export function rememberPlace(place: Airport) {
  loadRemembered()
  remembered.set(place.iata, place)
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...remembered.values()].slice(-50)))
  } catch {
    // Ignore: remembering names is only a convenience.
  }
}

export function isIataCode(value: string): boolean {
  return /^[A-Z]{3}$/.test(value)
}

// Finds a place by its 3-letter code. Codes we have no name for (e.g. from a
// shared link) are still valid, so they are returned with the code as name.
export function findAirport(iata: string): Airport | undefined {
  const code = iata.trim().toUpperCase()
  if (!isIataCode(code)) return undefined
  loadRemembered()
  return (
    remembered.get(code) ??
    AIRPORTS.find((airport) => airport.iata === code) ?? { iata: code, name: code, city: code, country: '' }
  )
}

// Returns the best matches for what the user typed, most relevant first.
export function searchAirports(query: string, limit = 8): Airport[] {
  const q = normalize(query)
  if (!q) return []

  const scored = AIRPORTS.map((airport) => {
    const iata = airport.iata.toLowerCase()
    const city = normalize(airport.city)
    let score = 0
    if (iata === q) score = 100
    else if (city.startsWith(q)) score = 80
    else if (iata.startsWith(q)) score = 70
    else if (normalize(airport.name).includes(q)) score = 50
    else if (city.includes(q)) score = 40
    else if (normalize(airport.country).startsWith(q)) score = 30
    return { airport, score }
  })

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.airport.city.localeCompare(b.airport.city))
    .slice(0, limit)
    .map((entry) => entry.airport)
}
