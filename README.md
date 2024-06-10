# bfsk-speech-recog-stream
A node.js module implementing a writable audio stream that detects Binary FSK (Frequency-shift keying) for testing purposes

Basically, bfsk is treated as language for speech processing where a frequency is specified to indicate 0 and another frequency is specified to indicate 1.

Then we can generate BFSK tones from text and this stream will detect the frequencies, convert them to binary and then back to text.

## Installation
```
npm i bfsk-speech-recog-stream
```

## Sample Usage

You will need to have some extra modules installed:
```
npm i tone-stream speaker
```
Then you can try this code:
```
const BSRS = require('bfsk-speech-recog-stream')
const { ToneStream, utils } = require('tone-stream')
const Speaker = require('speaker')

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
const tone_duration = 5 
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

sr.on('speech', data => {
  console.log(new Date(), 'speech', JSON.stringify(data, null, 2))
})

ts.pipe(sr)
ts.pipe(speaker)
```
Output:
```
2024-06-10T23:09:46.396Z speech {
  "transcript": "hello, world",
  "raw": "011010000110010101101100011011000110111100101100001000000111011101101111011100100110110001100100"
}
```
