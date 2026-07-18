export function dateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  )

  return `${values.year}-${values.month}-${values.day}`
}

function hashString(value: string): number {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  let value = seed >>> 0

  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function shuffledIndices(length: number, seed: number): number[] {
  const indices = Array.from({ length }, (_, index) => index)
  const random = mulberry32(seed)

  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]]
  }

  return indices
}

export function dailyCycleIndex(
  length: number,
  date: Date,
  timeZone: string,
  salt: string
): number {
  if (length <= 0) return -1

  const dateKey = dateKeyInTimeZone(date, timeZone)
  const dayNumber = Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000)
  const cycleNumber = Math.floor(dayNumber / length)
  const cyclePosition = ((dayNumber % length) + length) % length
  const order = shuffledIndices(length, hashString(`${salt}:${cycleNumber}`))

  return order[cyclePosition]
}

export function stableDailyIndex(
  length: number,
  date: Date,
  timeZone: string,
  salt: string
): number {
  if (length <= 0) return -1
  return hashString(`${dateKeyInTimeZone(date, timeZone)}:${salt}`) % length
}
