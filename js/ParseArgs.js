const fs = require('fs')
class ParseArgs {
  static getData (args, help) {
    const m = args.indexOf('-m')
    const f = args.indexOf('-f')
    if (m > 0 && args[m + 1]) {
      return args[m + 1]
    } else if (f > 0 && args[f + 1]) {
      if (fs.existsSync(args[f + 1])) {
        return fs.readFileSync(args[f + 1], 'utf8')
      } else {
        return { error: `no such file or directory ${args[f + 1]}` }
      }
    } else {
      return { error: help }
    }
  }

  static getOutput (args) {
    const o = args.indexOf('-o')
    if (o > 0 && args[o + 1]) {
      const arr = args[o + 1].split('/')
      if (arr[arr.length - 1] === '') arr.pop()
      const name = arr[arr.length - 1].includes('.') ? arr[arr.length - 1] : null
      const path = arr.length === 1
        ? process.env.PWD : arr[arr.length - 1].includes('.')
          ? arr.slice(0, arr.length - 1).join('/') : arr.join('/')
      if (fs.existsSync(path)) return { path, name }
      else return { error: `no such file or directory ${args[o + 1]}` }
    } else return { path: process.env.PWD }
  }
}

module.exports = ParseArgs
