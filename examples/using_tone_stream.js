const Speaker = require('speaker')

const { ToneStream, utils } = require('tone-stream')
const BfskSpeechRecogStream = require('../index.js')

const zero_freq = 500
const one_freq = 2000

const sampleRate = 8000

const language = `${zero_freq}:${one_freq}`

const audioFormat = 1 // LINEAR16

const signed = true

const format = {
  audioFormat,
  channels: 1,
  sampleRate,
  bitDepth: 16,
  signed,
}

const ts = new ToneStream(format)
const text = "hello, world"
const tone_duration = 5 // if you increase this, you might need to avoid calling "ts.pipe(speaker)" as it will cause processing of data to get slow and speech timeout will happen too soon.
const tones = utils.gen_binary_tones_from_text(text, tone_duration, zero_freq, one_freq, sampleRate)
ts.concat(tones)
ts.add([100, 's'])

const sr = new BfskSpeechRecogStream({
  format,
  params: {
    language,
  }
})

const speaker = new Speaker(format)

sr.on('bit', data => {
  console.log(new Date(), 'bit', data)
})

sr.on('speech', data => {
  console.log(new Date(), 'speech', JSON.stringify(data, null, 2))
})

ts.pipe(sr)
ts.pipe(speaker)
