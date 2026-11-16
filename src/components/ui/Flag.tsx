import { useId } from 'react'
import type { Language } from '../../i18n/locale'

// Small country flags for the language menu, drawn as SVG.
// (Flag emojis like 🇹🇷 don't show on Windows — it prints "TR" letters instead.)
// English uses the UK flag, Turkish the Turkish flag.

function UnitedKingdom() {
  const id = useId()
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="size-full">
      <clipPath id={`${id}-t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

function Turkey() {
  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="size-full">
      <rect width="1200" height="800" fill="#E30A17" />
      <circle cx="425" cy="400" r="200" fill="#fff" />
      <circle cx="475" cy="400" r="160" fill="#E30A17" />
      <path fill="#fff" d="M583.334 400l180.901 58.779-111.804-153.885v190.212l111.804-153.885z" />
    </svg>
  )
}

const FLAGS: Record<Language, () => React.JSX.Element> = { en: UnitedKingdom, tr: Turkey }

export default function Flag({ language, className = 'h-3.5 w-5' }: { language: Language; className?: string }) {
  const Drawing = FLAGS[language]
  return (
    <span aria-hidden="true" className={`inline-block shrink-0 overflow-hidden rounded-[3px] shadow-sm ring-1 ring-black/10 ${className}`}>
      <Drawing />
    </span>
  )
}
