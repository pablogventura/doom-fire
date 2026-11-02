// Paleta de 37 colores del fuego original de Doom.
const DOOM_COLORS = [
  { r: 7, g: 7, b: 7 },
  { r: 31, g: 7, b: 7 },
  { r: 47, g: 15, b: 7 },
  { r: 71, g: 15, b: 7 },
  { r: 87, g: 23, b: 7 },
  { r: 103, g: 31, b: 7 },
  { r: 119, g: 31, b: 7 },
  { r: 143, g: 39, b: 7 },
  { r: 159, g: 47, b: 7 },
  { r: 175, g: 63, b: 7 },
  { r: 191, g: 71, b: 7 },
  { r: 199, g: 71, b: 7 },
  { r: 223, g: 79, b: 7 },
  { r: 223, g: 87, b: 7 },
  { r: 223, g: 87, b: 7 },
  { r: 215, g: 95, b: 7 },
  { r: 215, g: 95, b: 7 },
  { r: 215, g: 103, b: 15 },
  { r: 207, g: 111, b: 15 },
  { r: 207, g: 119, b: 15 },
  { r: 207, g: 127, b: 15 },
  { r: 207, g: 135, b: 23 },
  { r: 199, g: 135, b: 23 },
  { r: 199, g: 143, b: 23 },
  { r: 199, g: 151, b: 31 },
  { r: 191, g: 159, b: 31 },
  { r: 191, g: 159, b: 31 },
  { r: 191, g: 167, b: 39 },
  { r: 191, g: 167, b: 39 },
  { r: 191, g: 175, b: 47 },
  { r: 183, g: 175, b: 47 },
  { r: 183, g: 183, b: 47 },
  { r: 183, g: 183, b: 55 },
  { r: 207, g: 207, b: 111 },
  { r: 223, g: 223, b: 159 },
  { r: 239, g: 239, b: 199 },
  { r: 255, g: 255, b: 255 },
]

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function lerpColor(from, to, amount) {
  return {
    r: clampChannel(from.r + (to.r - from.r) * amount),
    g: clampChannel(from.g + (to.g - from.g) * amount),
    b: clampChannel(from.b + (to.b - from.b) * amount),
  }
}

function resample(colors, size) {
  if (size === colors.length) {
    return colors.map((color) => ({ ...color }))
  }

  const resampled = []
  const lastIndex = colors.length - 1
  for (let index = 0; index < size; index += 1) {
    const position = size === 1 ? 0 : (index / (size - 1)) * lastIndex
    const leftIndex = Math.floor(position)
    const rightIndex = Math.min(lastIndex, leftIndex + 1)
    resampled.push(lerpColor(colors[leftIndex], colors[rightIndex], position - leftIndex))
  }
  return resampled
}

function toBlue(color) {
  return {
    r: color.b,
    g: clampChannel(color.g * 0.85),
    b: color.r,
  }
}

function toPink(color) {
  return {
    r: color.r,
    g: clampChannel(color.g * 0.35),
    b: clampChannel(color.b * 0.4 + color.r * 0.65),
  }
}

export function hexToRgb(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex)
  const value = match ? match[1] : '000000'
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  }
}

export function rgbToHex(color) {
  const channel = (value) => clampChannel(value).toString(16).padStart(2, '0')
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`
}

function rampFromStops(cold, mid, hot, size) {
  const ramp = []
  for (let index = 0; index < size; index += 1) {
    const amount = size === 1 ? 0 : index / (size - 1)
    if (amount <= 0.5) {
      ramp.push(lerpColor(cold, mid, amount / 0.5))
    } else {
      ramp.push(lerpColor(mid, hot, (amount - 0.5) / 0.5))
    }
  }
  return ramp
}

export function buildPalette({ size, preset, cold, mid, hot }) {
  if (preset === 'custom') {
    return rampFromStops(hexToRgb(cold), hexToRgb(mid), hexToRgb(hot), size)
  }

  const transformed = DOOM_COLORS.map((color) => {
    if (preset === 'blue') return toBlue(color)
    if (preset === 'pink') return toPink(color)
    return { ...color }
  })
  return resample(transformed, size)
}

export function paletteStops(preset) {
  const palette = buildPalette({
    size: 37,
    preset,
    cold: '#000000',
    mid: '#808080',
    hot: '#ffffff',
  })
  const lastIndex = palette.length - 1
  return {
    cold: rgbToHex(palette[0]),
    mid: rgbToHex(palette[Math.floor(lastIndex / 2)]),
    hot: rgbToHex(palette[lastIndex]),
  }
}
