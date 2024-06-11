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
npm i bfsk-speech-synth-stream speaker
```
Then you can try this code:
```
const Speaker = require('speaker')

const BfskSpeechSynthStream = require('bfsk-speech-synth-stream')
const BfskSpeechRecogStream = require('bfsk-speech-recog-stream')

const zero_freq = 500
const one_freq = 2000

const sampleRate = 8000

const language = `${zero_freq}:${one_freq}`
const voice = '5' // tone_duration

const audioFormat = 1 // LINEAR16

const signed = true

const format = {
  audioFormat,
  channels: 1,
  sampleRate,
  bitDepth: 16,
  signed,
}

const params = {
  text: 'hello, world',
  language,
  voice,
}

const opts = {
  format,
  params,
}

const ss = new BfskSpeechSynthStream(opts)

const sr = new BfskSpeechRecogStream({
  format,
  params: {
    language,
  }
})

const speaker = new Speaker(format)

sr.on('speech', data => {
  console.log(new Date(), 'speech', JSON.stringify(data, null, 2))
})

ss.pipe(sr)
ss.pipe(speaker)

```
Output:
```
2024-06-11T00:32:25.174Z speech {
  "transcript": "hello, world",
  "raw": "011010000110010101101100011011000110111100101100001000000111011101101111011100100110110001100100"
}
```
