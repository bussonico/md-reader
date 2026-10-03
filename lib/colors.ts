export function generateCoverGradient(title: string): { gradient: string; textColor: string } {
  // Hash title to consistent numbers
  let h1 = 0, h2 = 0, h3 = 0
  for (let i = 0; i < title.length; i++) {
    const c = title.charCodeAt(i)
    h1 = (h1 * 31 + c) % 360
    h2 = (h2 * 37 + c) % 360
    h3 = (h3 * 41 + c) % 360
  }

  const color1 = `hsl(${h1}, 60%, 40%)`
  const color2 = `hsl(${(h1 + 60) % 360}, 70%, 55%)`
  const color3 = `hsl(${(h1 + 120) % 360}, 50%, 35%)`

  const angle = (h2 % 180)
  const gradient = `linear-gradient(${angle}deg, ${color1}, ${color2} 60%, ${color3})`

  return { gradient, textColor: '#FFFFFF' }
}

// Keep for backward compat
export function generateCoverColor(title: string): string {
  return generateCoverGradient(title).gradient
}

export function getTextColorForBg(_bgColor: string): string {
  return '#FFFFFF'
}

export function hashTitle(title: string): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    const char = title.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}
