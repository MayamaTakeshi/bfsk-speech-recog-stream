const Speaker = require('speaker')
const au = require('@mayama/audio-utils')

const { ToneStream, utils } = require('tone-stream')
const BSRS = require('../index.js')

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
const tone_duration = 10
const tones = utils.gen_binary_tones_from_text(text, tone_duration, zero_freq, one_freq, sampleRate)
ts.concat(tones)
ts.add([100, 's'])

const sr = new BSRS({
  format,
  params: {
    language,
  }
})

const speaker = new Speaker(format)

// We need to write some initial silence to the speaker to avoid scratchyness/gaps
const size = 320 * 64
console.log("writing initial silence to speaker", size)
data = au.gen_silence(audioFormat, signed, size)
speaker.write(data)

sr.on('binary', data => {
  console.log('binary', data)
})

sr.on('speech', data => {
  console.log('speech', JSON.stringify(data, null, 2))
})

ts.pipe(sr)
ts.pipe(speaker)
