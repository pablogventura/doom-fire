export class FireRenderer {
  constructor(canvas) {
    this.canvas = canvas
    this.context = canvas.getContext('2d', { alpha: false })
    this.imageData = null
  }

  resize(columns, rows) {
    this.canvas.width = columns
    this.canvas.height = rows
    this.imageData = this.context.createImageData(columns, rows)
  }

  draw(cells, palette) {
    const { width, height } = this.canvas
    if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
      this.imageData = this.context.createImageData(width, height)
    }

    const pixels = this.imageData.data
    const lastColor = palette.length - 1
    for (let index = 0, count = width * height; index < count; index += 1) {
      const colorIndex = Math.min(cells[index], lastColor)
      const color = palette[colorIndex] ?? palette[0]
      if (!color) continue
      const offset = index * 4
      pixels[offset] = color.r
      pixels[offset + 1] = color.g
      pixels[offset + 2] = color.b
      pixels[offset + 3] = 255
    }

    this.context.putImageData(this.imageData, 0, 0)
  }

  fit(stage) {
    const columns = this.canvas.width
    const rows = this.canvas.height
    const maxWidth = stage.clientWidth
    const maxHeight = stage.clientHeight
    if (!columns || !rows || !maxWidth || !maxHeight) return

    let scale = Math.min(maxWidth / columns, maxHeight / rows)
    if (scale >= 1) scale = Math.floor(scale)
    this.canvas.style.width = `${Math.max(1, Math.floor(columns * scale))}px`
    this.canvas.style.height = `${Math.max(1, Math.floor(rows * scale))}px`
  }
}
