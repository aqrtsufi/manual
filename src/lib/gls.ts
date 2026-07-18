export type GlsSegment =
  | { type: 'text'; text: string }
  | { type: 'gls'; id: string; label?: string }

const GLS_PATTERN = /\[\[gls:([a-zA-Z0-9_-]+)(?:\|([^\]]+))?\]\]/g

export function parseGlsText(value: string): GlsSegment[] {
  const segments: GlsSegment[] = []
  let lastIndex = 0

  for (const match of value.matchAll(GLS_PATTERN)) {
    const index = match.index ?? 0

    if (index > lastIndex) {
      segments.push({
        type: 'text',
        text: value.slice(lastIndex, index)
      })
    }

    segments.push({
      type: 'gls',
      id: match[1],
      label: match[2]?.trim() || undefined
    })

    lastIndex = index + match[0].length
  }

  if (lastIndex < value.length) {
    segments.push({
      type: 'text',
      text: value.slice(lastIndex)
    })
  }

  return segments
}
