const C = require('./Colors.js')

class PrintText {
  static terminalSize (includePrompt) {
    const sub = includePrompt ? 0 : 1
    const width = process.stdout.columns
    const height = process.stdout.rows - sub
    return { width, height }
  }

  static nbsp (debugView) {
    return debugView ? '_' : ' '
  }

  static lineBreak (wrap, d) {
    let out = ''
    const w = this.terminalSize().width
    for (let i = 0; i < w; i++) { out += this.nbsp(d) }
    if (!wrap) out += '\n'
    return out
  }

  static atX (txt, x, d) {
    let out = ''
    for (let i = 0; i < x; i++) { out += this.nbsp(d) }
    out += txt
    const padRight = this.terminalSize().width - x - txt.length
    for (let i = 0; i < padRight; i++) { out += this.nbsp(d) }
    return out
  }

  static atXY (txt, x, y, d) {
    let out = ''
    for (let i = 0; i < y; i++) { out += this.lineBreak(null, d) }
    out += this.atX(txt, x, d)
    return out
  }

  static relXY (txt, x, y, debug) {
    const s = this.terminalSize()
    x = Math.floor(s.width * x)
    y = Math.floor(s.height * y)
    return this.atXY(txt, x, y, debug)
  }

  static textSize (txt, frac, d) {
    const s = this.terminalSize()
    let width, height
    if (frac) {
      height = Math.floor(Math.sqrt(txt.length)) / frac
      width = Math.floor(Math.sqrt(txt.length)) * frac
      let out = ''
      let i = 0
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          out += txt[i] || this.nbsp(d)
          i++
        }
        out += '\n'
      }
      txt = out
      height = Math.floor(height)
      if (Math.floor(Math.sqrt(txt.length)) % frac > 0) { height++ }
    } else {
      const rows = Math.floor(txt.length / s.width)
      height = rows
      const tail = txt.length % s.width
      if (tail > 0) height++
      if (rows > 0) width = s.width
      else { width = txt.length }
    }
    return { width, height, text: txt }
  }

  static center (txt, frac, d) {
    const s = this.terminalSize()
    const t = this.textSize(txt, frac)
    let out = ''

    const ydiff = s.height - t.height
    const yPad = Math.floor(ydiff / 2)
    for (let i = 0; i < yPad; i++) { out += this.lineBreak(null, d) }

    if (!frac) {
      // center text on the screen w/out modifing the text itself
      let x = Math.floor(s.width * 0.5)
      x -= Math.round(t.width / 2)
      out += this.atX(txt, x, d)
      out += '\n'
    } else {
      // wrap the text based on some fraction of the screen && then center it
      const arr = t.text.split('\n')
      if (arr[arr.length - 1] === '') arr.pop()
      let x = Math.floor(s.width * 0.5)
      x -= Math.round(t.width / 2)
      for (let i = 0; i < arr.length; i++) {
        out += this.atX(arr[i], x, d)
        out += '\n'
      }
    }

    for (let i = 0; i < yPad - 1; i++) { out += this.lineBreak(null, d) }
    if (ydiff % 2 > 0) out += this.lineBreak(null, d)

    return out
  }

  static blend (a, b, frac) {
    const chance = a.length * frac
    const arrA = a.split('\n').filter(s => s !== '').map(str => str.split(''))
    const arrB = b.split('\n').filter(s => s !== '').map(str => str.split(''))

    for (let i = 0; i < arrA.length; i++) {
      for (let j = 0; j < arrA[i].length; j++) {
        if (Math.random() * a.length > chance) {
          arrA[i][j] = C[23] + arrB[i][j] + C[0]
        } else {
          arrA[i][j] = C[23] + C[19] + arrA[i][j] + C[0]
        }
      }
    }

    let out = arrA.map(s => s.join(''))
    out = out.join('\n')
    return out
  }

  static slim (txt) {
    const s = this.terminalSize()
    const w = s.width - 2
    let arr = txt.split('\n')
    arr = arr.map(str => {
      if (str.length > w) {
        const a = []
        for (let i = 0; i < str.length; i += w) a.push(str.substring(i, i + w))
        return a
      } else return [str]
    })

    const pad = (s) => {
      const diff = w - s.length
      for (let i = 0; i < diff; i++) { s += ' ' }
      return s
    }

    const out = arr.map(a => {
      if (a.length === 1) {
        return pad(a[0])
      } else {
        return a.map(s => pad(s)).join('\n')
      }
    }).join('\n')

    return out
  }
}

module.exports = PrintText
