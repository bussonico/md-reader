export function hashTitle(title: string): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    const char = title.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function generateCoverColor(title: string): string {
  const hash = hashTitle(title)
  const hue = hash % 360
  const saturation = 45 + (hash % 30)
  const lightness = 35 + (hash % 25)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export function getTextColorForBg(bgColor: string): string {
  // Extract lightness from HSL
  const match = bgColor.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/)
  if (match) {
    const lightness = parseInt(match[1])
    return lightness > 55 ? '#1a1a1a' : '#f5f5f5'
  }
  return '#f5f5f5'
}
