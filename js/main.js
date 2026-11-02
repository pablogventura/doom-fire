import { buildPalette } from './palette.js'
import { FireSimulation } from './simulation.js'
import { FireRenderer } from './renderer.js'
import {
  applyPresetStops,
  readControls,
  syncControlLabels,
  syncSourceLimit,
  syncWindFields,
  writeControls,
  CLASSIC_CONTROLS,
} from './controls.js'

const form = document.querySelector('#controls')
const stage = document.querySelector('#stage')
const canvas = document.querySelector('#fire')
const pauseButton = document.querySelector('#pause')
const resetButton = document.querySelector('#reset')
const classicButton = document.querySelector('#classic')

const config = readControls(form)
config.paused = false

const simulation = new FireSimulation(config)
const renderer = new FireRenderer(canvas)
let palette = buildPalette(config)

function brushRadius() {
  return config.columns >= 100 || config.rows >= 80 ? 1 : 0
}

function render() {
  palette = buildPalette({
    size: config.paletteSize,
    preset: config.preset,
    cold: config.cold,
    mid: config.mid,
    hot: config.hot,
  })
  renderer.draw(simulation.cells, palette)
}

function publishControls() {
  const previousColumns = config.columns
  const previousRows = config.rows
  const previousPaletteSize = config.paletteSize
  const paused = config.paused

  syncSourceLimit(form, Number.parseInt(form.elements.paletteSize.value, 10))
  Object.assign(config, readControls(form))
  config.paused = paused

  const structureChanged = config.columns !== previousColumns
    || config.rows !== previousRows
    || config.paletteSize !== previousPaletteSize

  if (structureChanged) {
    simulation.resize()
    renderer.resize(config.columns, config.rows)
  }

  syncControlLabels(form)
  syncWindFields(form)
  renderer.fit(stage)
  render()
}

function paintFromPointer(event, erase) {
  const rect = canvas.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return

  const x = Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width)
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height)
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return

  const intensity = erase ? 0 : config.sourceIntensity
  simulation.paint(x, y, brushRadius(), intensity)
  render()
}

let isDrawing = false
let isErasing = false

canvas.addEventListener('contextmenu', (event) => event.preventDefault())

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 && event.button !== 2) return
  isDrawing = true
  isErasing = event.button === 2
  paintFromPointer(event, isErasing)
  try {
    canvas.setPointerCapture(event.pointerId)
  } catch {
    // A synthetic pointer event has no id to capture.
  }
})

canvas.addEventListener('pointermove', (event) => {
  if (!isDrawing) return
  paintFromPointer(event, isErasing)
})

function stopDrawing() {
  isDrawing = false
}

canvas.addEventListener('pointerup', stopDrawing)
canvas.addEventListener('pointercancel', stopDrawing)
canvas.addEventListener('lostpointercapture', stopDrawing)

form.addEventListener('input', (event) => {
  const { name } = event.target
  if (name === 'cold' || name === 'mid' || name === 'hot') {
    form.elements.preset.value = 'custom'
  }
  publishControls()
})

form.addEventListener('change', (event) => {
  if (!(event.target instanceof HTMLSelectElement)) return
  if (event.target.name === 'preset') applyPresetStops(form)
  publishControls()
})

pauseButton.addEventListener('click', () => {
  config.paused = !config.paused
  pauseButton.textContent = config.paused ? 'Seguir' : 'Pausa'
  pauseButton.setAttribute('aria-pressed', String(config.paused))
})

resetButton.addEventListener('click', () => {
  simulation.reset()
  render()
})

classicButton.addEventListener('click', () => {
  const paused = config.paused
  writeControls(form, CLASSIC_CONTROLS)
  publishControls()
  config.paused = paused
  simulation.reset()
  render()
})

new ResizeObserver(() => renderer.fit(stage)).observe(stage)

renderer.resize(config.columns, config.rows)
syncWindFields(form)
syncControlLabels(form)
renderer.fit(stage)
render()

let lastFrameMs = performance.now()
let accumulatorMs = 0

function frame(now) {
  const elapsedMs = now - lastFrameMs
  lastFrameMs = now

  if (!config.paused) {
    const frameMs = 1000 / Math.max(1, config.fps)
    accumulatorMs += elapsedMs
    let steps = 0
    while (accumulatorMs >= frameMs && steps < 4) {
      simulation.step(frameMs)
      accumulatorMs -= frameMs
      steps += 1
    }
    if (steps > 0) render()
  } else {
    accumulatorMs = 0
  }

  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
