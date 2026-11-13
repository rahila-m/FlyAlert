// Downloads the public airline list from Travelpayouts and saves a compact
// { "TK": "Turkish Airlines", ... } map that the Worker bundles.
// Run when the list should be refreshed:  npm run update-airlines
import { writeFileSync } from 'node:fs'

const SOURCE = 'https://api.travelpayouts.com/data/en/airlines.json'
const OUTPUT = new URL('../src/data/airlines.json', import.meta.url)

const response = await fetch(SOURCE)
if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`)
const airlines = await response.json()

const map = {}
for (const airline of airlines) {
  const code = airline.code?.trim()
  const name = (airline.name_translations?.en ?? airline.name)?.trim()
  // IATA airline codes are 2 characters: letters or digits.
  if (code && name && /^[A-Z0-9]{2}$/.test(code)) map[code] = name
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(OUTPUT, JSON.stringify(sorted, null, 0) + '\n')
console.log(`Saved ${Object.keys(sorted).length} airlines to src/data/airlines.json`)
