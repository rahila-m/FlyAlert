export default function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold tracking-wider text-brand-700 uppercase">
        <span className="size-1.5 rounded-full bg-accent-500" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-lg leading-relaxed text-ink-muted">{description}</p>}
    </div>
  )
}
