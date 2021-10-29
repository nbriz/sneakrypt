class NoiseText {
  static terminalSize (includePrompt) {
    const sub = includePrompt ? 0 : 1
    const width = process.stdout.columns
    const height = process.stdout.rows - sub
    return { width, height }
  }

  static ranCharFromSet (charset) {
    const s = Math.floor(Math.random() * charset.length)
    const str = charset[s]
    if (str.length > 1) {
      const c = Math.floor(Math.random() * str.length)
      return str[c]
    } else return str
  }

  static rowFromSet (charset) {
    const s = this.terminalSize()
    let out = ''
    for (let j = 0; j < s.width; j++) { out += this.ranCharFromSet(charset) }
    out += '\n'
    return out
  }

  static wallFromSet (charset, blue) {
    const s = this.terminalSize()
    let out = ''
    for (let i = 0; i < s.height - 1; i++) {
      for (let j = 0; j < s.width; j++) { out += this.ranCharFromSet(charset) }
      out += '\n'
    }
    return out
  }

  static text2noise (txt, charset) {
    const arrA = txt.split('\n').filter(s => s !== '').map(str => str.split(''))
    for (let i = 0; i < arrA.length; i++) {
      for (let j = 0; j < arrA[i].length; j++) {
        if (arrA[i][j] !== ' ') arrA[i][j] = this.ranCharFromSet(charset)
      }
    }
    let out = arrA.map(s => s.join(''))
    out = out.join('\n')
    return out
  }
}

module.exports = NoiseText
