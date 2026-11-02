import { paletteStops } from './palette.js'

export const CLASSIC_CONTROLS = {
  columns: 80,
  rows: 50,
  fps: 20,
  sourceIntensity: 36,
  sourceThickness: 1,
  decayMin: 0,
  decayMax: 2,
  windMode: 'classic',
  windSign: -1,
  windSpread: 2,
  windPeriod: 4,
  direction: 'up',
  paletteSize: 37,
  preset: 'doom',
  cold: '#070707',
  mid: '#cf6f0f',
  hot: '#ffffff',
}

function integerValue(form, name) {
  return Number.parseInt(form.elements[name].value, 10)
}

export function readControls(form) {
  return {
    columns: integerValue(form, 'columns'),
    rows: integerValue(form, 'rows'),
    fps: integerValue(form, 'fps'),
    sourceIntensity: integerValue(form, 'sourceIntensity'),
    sourceThickness: integerValue(form, 'sourceThickness'),
    decayMin: integerValue(form, 'decayMin'),
    decayMax: integerValue(form, 'decayMax'),
    windMode: form.elements.windMode.value,
    windSign: integerValue(form, 'windSign'),
    windSpread: integerValue(form, 'windSpread'),
    windPeriodMs: integerValue(form, 'windPeriod') * 1000,
    direction: form.elements.direction.value,
    paletteSize: integerValue(form, 'paletteSize'),
    preset: form.elements.preset.value,
    cold: form.elements.cold.value,
    mid: form.elements.mid.value,
    hot: form.elements.hot.value,
  }
}

export function writeControls(form, controls) {
  for (const [name, value] of Object.entries(controls)) {
    const field = form.elements[name]
    if (field) field.value = String(value)
  }
  syncControlLabels(form)
  syncWindFields(form)
}

export function syncControlLabels(form) {
  for (const input of form.querySelectorAll('input[type="range"]')) {
    const output = form.querySelector(`output[for="${input.id}"]`)
    if (output) output.value = input.value
  }
}

export function syncWindFields(form) {
  const mode = form.elements.windMode.value
  form.querySelector('[data-wind="sign"]').hidden = mode !== 'fixed'
  form.querySelector('[data-wind="spread"]').hidden = mode === 'classic'
  form.querySelector('[data-wind="period"]').hidden = mode !== 'oscillating'
}

export function syncSourceLimit(form, paletteSize) {
  const input = form.elements.sourceIntensity
  const maxIntensity = paletteSize - 1
  input.max = String(maxIntensity)
  if (Number.parseInt(input.value, 10) > maxIntensity) {
    input.value = String(maxIntensity)
  }
}

export function applyPresetStops(form) {
  const preset = form.elements.preset.value
  if (preset === 'custom') return
  const stops = paletteStops(preset)
  form.elements.cold.value = stops.cold
  form.elements.mid.value = stops.mid
  form.elements.hot.value = stops.hot
}
