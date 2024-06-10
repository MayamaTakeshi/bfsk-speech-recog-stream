const goertzel = require('goertzel-stream')

const { Writable } = require("stream")

const events = require("events")

type Format = {
  audioFormat: number,
  sampleRate: number,
  channels: number,
  bitDepth: number,
}

type Params = {
  language: string,
  request?: Record<string, unknown>,
}

type Config = Record<string, unknown>

type Opts = {
  uuid?: string,
  format: Format,
  params: Params,
  config: Config,
}

class MockAudioBuffer {
  data: Float32Array

  constructor(data: Float32Array) {
    this.data = data;
  }

  getChannelData(channel: number) {
    return this.data;
  }
}

type EventCallback = (...args: any[]) => void

function L16Buffer_to_Float32Array(buffer: Buffer) {
    var data = new Float32Array(buffer.length / 2);
    for (var i = 0; i < data.length; i++) {
        var sample = buffer.readInt16LE(i * 2);
        data[i] = sample * 2 / 0x7FFF;
    }
    return data;
}


interface DataItem {
  key?: string;
  start: number;
  end: number;
}

interface Data {
  [key: string]: DataItem;
}

class BfskSpeechRecogStream extends Writable {
  eventEmitter: any

  constructor(opts: Opts) {
    super();

    const gs_opts = {
      sampleRate: opts.format.sampleRate,
      testsPerSecond: 500,
      samplesPerFrame: 1024,
    }

    const arr = (opts.params.language as string).split(":")
    this.zero = arr[0]
    this.one = arr[1]

    const zero = parseInt(this.zero)
    const one = parseInt(this.one)

    if(!this.zero || !this.one) {
      throw new Error(`Invalid language ${opts.config.language}`)
    }

    this.detector = goertzel([zero, one], gs_opts)
    this.detector.on('toneEnd', (data: Data) => {
      // generate array of objects adding the key
      const arr = Object.keys(data).map(k => { data[k].key = k; return data[k]})
      // sort in place by end
      arr.sort((a,b) => { return a.end - b.end})

      arr.forEach(item => {
        var binary
        if(item.key == this.zero) {
          binary = 0
        } else if(item.key == this.one) {
          binary = 1
        } else {
          return
        }
        this.eventEmitter.emit('binary', binary)
      })
    })

    this.eventEmitter = new events.EventEmitter()
  }

  on(evt: string, cb: EventCallback) {
    super.on(evt, cb);

    this.eventEmitter.on(evt, cb);
  }

  _write(data: Buffer, enc: number, callback: EventCallback) {
    const d = L16Buffer_to_Float32Array(data)
    const ab = new MockAudioBuffer(d) 

    this.detector.write(ab)

    callback();
    return true;
  }
}

module.exports = BfskSpeechRecogStream;
