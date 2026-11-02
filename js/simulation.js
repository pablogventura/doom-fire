function randomInt(min, max) {
  const low = Math.min(min, max) | 0
  const high = Math.max(min, max) | 0
  return low + Math.floor(Math.random() * (high - low + 1))
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export class FireSimulation {
  constructor(config) {
    this.config = config
    this.windPhaseMs = 0
    this.cells = new Uint8Array(0)
    this.nextCells = new Uint8Array(0)
    this.resize()
  }

  resize() {
    const count = this.config.columns * this.config.rows
    this.cells = new Uint8Array(count)
    this.nextCells = new Uint8Array(count)
    this.windPhaseMs = 0
    this.applySource(this.cells)
  }

  reset() {
    this.cells.fill(0)
    this.windPhaseMs = 0
    this.applySource(this.cells)
  }

  index(x, y) {
    return x + y * this.config.columns
  }

  sourceSpan() {
    const { columns, rows, direction, sourceThickness } = this.config
    const length = direction === 'left' || direction === 'right' ? columns : rows
    return clamp(sourceThickness, 1, length)
  }

  isSource(x, y) {
    const { columns, rows, direction } = this.config
    const thickness = this.sourceSpan()
    if (direction === 'up') return y >= rows - thickness
    if (direction === 'down') return y < thickness
    if (direction === 'left') return x >= columns - thickness
    return x < thickness
  }

  sourceNeighbor(x, y) {
    const { direction } = this.config
    if (direction === 'up') return [x, y + 1]
    if (direction === 'down') return [x, y - 1]
    if (direction === 'left') return [x + 1, y]
    return [x - 1, y]
  }

  shiftTarget(x, y, shift) {
    const { direction } = this.config
    if (direction === 'left' || direction === 'right') return [x, y + shift]
    return [x + shift, y]
  }

  windShift(decay) {
    const { windMode, windSign, windSpread, windPeriodMs } = this.config
    if (windMode === 'classic') return -decay

    const spread = Math.max(0, windSpread)
    if (spread === 0) return 0

    if (windMode === 'fixed') {
      if (windSign === 0) return 0
      return windSign * randomInt(0, spread)
    }

    const periodMs = Math.max(200, windPeriodMs)
    const angle = (this.windPhaseMs / periodMs) * Math.PI * 2
    const bias = Math.sin(angle) * spread
    const jitter = randomInt(-1, 1)
    return clamp(Math.round(bias + jitter), -spread, spread)
  }

  applySource(buffer) {
    const { columns, rows, paletteSize, sourceIntensity } = this.config
    const intensity = clamp(sourceIntensity, 0, paletteSize - 1)
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        if (this.isSource(x, y)) buffer[this.index(x, y)] = intensity
      }
    }
  }

  step(deltaMs) {
    if (this.config.paused) return

    const { columns, rows, decayMin, decayMax } = this.config
    this.applySource(this.cells)
    this.windPhaseMs += deltaMs
    this.nextCells.set(this.cells)

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        if (this.isSource(x, y)) continue

        const [neighborX, neighborY] = this.sourceNeighbor(x, y)
        if (neighborX < 0 || neighborY < 0 || neighborX >= columns || neighborY >= rows) continue

        const decay = randomInt(decayMin, decayMax)
        const neighborIntensity = this.cells[this.index(neighborX, neighborY)]
        const intensity = Math.max(0, neighborIntensity - decay)
        const [targetX, targetY] = this.shiftTarget(x, y, this.windShift(decay))
        if (targetX < 0 || targetY < 0 || targetX >= columns || targetY >= rows) continue
        if (this.isSource(targetX, targetY)) continue

        this.nextCells[this.index(targetX, targetY)] = intensity
      }
    }

    this.applySource(this.nextCells)
    const previous = this.cells
    this.cells = this.nextCells
    this.nextCells = previous
  }

  paint(x, y, radius, intensity) {
    const { columns, rows, paletteSize } = this.config
    const value = clamp(intensity, 0, paletteSize - 1)
    for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
      for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
        const pixelX = x + offsetX
        const pixelY = y + offsetY
        if (pixelX < 0 || pixelY < 0 || pixelX >= columns || pixelY >= rows) continue
        this.cells[this.index(pixelX, pixelY)] = value
      }
    }
  }
}
