// refs: https://www.youtube.com/watch?v=F5bAa6gFvLs
const fs = require('fs')
const prompt = require('prompt')
const triplesec = require('triplesec')
const Print = require('./js/PrintText.js')
const Noise = require('./js/NoiseText.js')
const Parse = require('./js/ParseArgs.js')
const C = require('./js/Colors.js')
const help = require('./js/help-file.js')
const charset = [
  // '█▓▒░',
  // '▀▇▆▅▃',
  '╤╔╚╞╩╘',
  '▖▗▘▙▚▛▜▜▞▟',
  '₠₡₢₣₤₥₦₧₨₩₪₫€₭₮₯₰₱₲₳₴₵₶₷₸₹₺₼₽₿',
  '¢¡£¥§«¬µ±¿¶Þßóöìíëêçãðñø'
]

function animate (plaintext, type, callback) {
  const s = Print.terminalSize()
  const area = s.width * s.height
  if (plaintext.length >= area) {
    plaintext = Print.slim(plaintext)
    plaintext = plaintext.split('\n').slice(0, s.height - 2).join('\n')
    plaintext += '\n...'
  }

  const t = Print.textSize(plaintext)
  let frac
  if (t.height > 1) {
    const max = area - s.width * 3
    frac = (plaintext.length >= max)
      ? 0 : (plaintext.length >= max * 0.5)
        ? 2 : (plaintext.length >= max * 0.25)
          ? 3 : 5
  }
  const text = Print.center(plaintext, frac)
  const noise = Noise.text2noise(text, charset)
  let amount = 0
  let wallrows = 0

  function noiseText (next) {
    if (amount < 1) setTimeout(() => noiseText(next), 50)
    else { amount = 0; next() }
    const n = Noise.text2noise(text, charset)
    const mix = Print.blend(text, n, 0)
    console.clear()
    console.log(mix)
    amount += 0.025
    if (amount > 1) amount = 1
  }

  function draw (e, cb) {
    if (amount < 1) setTimeout(() => draw(e, cb), 150)
    const mix = e
      ? Print.blend(noise, text, amount)
      : Print.blend(text, noise, amount)
    console.clear()
    console.log(mix)
    amount += 0.05
    if (amount > 1) amount = 1
    if (amount === 1 && cb) cb()
  }

  function decrypt () {
    console.clear()
    let out = ''
    for (let i = 0; i < wallrows; i++) { out += Noise.rowFromSet(charset) }
    console.log(out)
    wallrows++
    if (wallrows < s.height) setTimeout(decrypt, 50)
    else {
      const blueWall = C[23] + C[19] + Noise.wallFromSet(charset, 'blue') + C[0]
      const blueMsg = C[23] + C[19] + Noise.text2noise(text, charset) + C[0]
      console.clear(); console.log(blueWall)
      setTimeout(() => { console.clear(); console.log(blueMsg) }, 250)
      setTimeout(() => { noiseText(draw) }, 1250)
    }
  }

  function encrypt (cb) {
    console.clear()
    console.log(text)
    setTimeout(() => {
      draw(true, () => {
        console.clear()
        console.log(Noise.text2noise(text, charset))
        setTimeout(() => {
          console.clear()
          console.log(Noise.wallFromSet(charset, 'blue'))
          setTimeout(() => { console.clear(); cb() }, 250)
        }, 500)
      })
    }, 500)
  }

  if (type === 'encrypt') encrypt(callback)
  else if (type === 'decrypt') decrypt()
}

async function main () {
  if (process.argv[2] === 'encrypt' || process.argv[2] === 'e') {
    const out = Parse.getOutput(process.argv)
    const data = Parse.getData(process.argv, help)
    if (data.error) console.log(data.error)
    else {
      prompt.start()
      const pw = await prompt.get({ name: 'password', hidden: true })
      triplesec.encrypt({
        data: triplesec.Buffer.from(data),
        key: triplesec.Buffer.from(pw.password),
        progress_hook: function (obj) { /* ... */ }
      }, (err, buff) => {
        if (err) return console.log(err)
        const ciphertext = buff.toString('hex')
        const filename = out.name || 'secrets.txt'
        const filepath = out.path + '/' + filename
        fs.writeFile(filepath, ciphertext, (err) => {
          if (err) return console.log(err)
          animate(data, 'encrypt', () => {
            const m = `created encrypted file: ${filepath}`
            const o = C[23] + C[19] + m + C[0]
            console.log(o)
          })
        })
      })
    }
  } else if (process.argv[2] === 'decrypt' || process.argv[2] === 'd') {
    const data = Parse.getData(process.argv, help)
    const out = Parse.getOutput(process.argv)
    if (data.error) console.log(data.error)
    else {
      prompt.start()
      const pw = await prompt.get({ name: 'password', hidden: true })
      triplesec.decrypt({
        data: triplesec.Buffer.from(data, 'hex'),
        key: triplesec.Buffer.from(pw.password),
        progress_hook: function (obj) { /* ... */ }
      }, (err, buff) => {
        const c = C[23] + C[19]
        if (err) return console.log(`${c}wrong password${C[0]}`)
        const plaintext = buff.toString()
        const filename = out.name || 'noMoreSecrets.txt'
        const filepath = out.path + '/' + filename
        fs.writeFile(filepath, plaintext, (err) => {
          if (err) return console.log(err)
          animate(plaintext, 'decrypt')
        })
      })
    }
  } else { console.log(help) }
}

main()
