// based on https://github.com/substack/node-garbage/blob/master/index.js
import CID from 'multiformats/cid'
import { create as createDigest } from 'multiformats/hashes/digest'

const codecs = [0x55, 0x70, 0x71, 0x0129]
const hashes = [[0x12, 256], [0x16, 256], [0x1b, 256], [0xb220, 256], [0x13, 512], [0x15, 384], [0x14, 512]]
const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()-_=+[]{}|\\:;\'",.<>?/ \t\n😀'

function garbage (count = 200, options = {}) {
  return generate(count, options)[1]
}

function generate (count, options) {
  let totWeight = 0
  const types = Object.keys(generators).map((t) => {
    /* c8 ignore next 4 */
    const weight = options.weights && typeof options.weights[t] === 'number' ? options.weights[t] : 1
    if (weight < 0) {
      throw new TypeError('Cannot have a negative weight')
    }
    totWeight += weight
    return [t, weight]
  })
  /* c8 ignore next 3 */
  if (totWeight === 0) {
    throw new Error('Cannot have a total weight of zero')
  }
  const rnd = Math.random() * totWeight
  let wacc = 0
  for (const [type, weight] of types) {
    wacc += weight
    if (wacc >= rnd) {
      return generators[type](count, options)
    }
  }
  /* c8 ignore next 1 */
  throw new Error('Internal error')
}

function rndSize (bias = 5) {
  return Math.abs(Math.floor(5 / (1 - (Math.random() ** 2)) - 5 + Math.random() * bias))
}

function rndChar () {
  return charset.charAt(Math.floor(Math.random() * charset.length))
}

function rndByte () {
  return Math.floor(Math.random() * 256)
}

const generators = {
  list (count, options) {
    const res = []
    if (count <= 0) {
      return [1, res]
    }
    const len = rndSize()
    let size = 1
    for (let i = 0; i < len && size < count; i++) {
      const x = generate(--count - len, options)
      res.push(x[1])
      size += x[0]
    }
    return [size, res]
  },

  map (count, options) {
    const res = {}
    if (count <= 0) {
      return [1, res]
    }
    const len = rndSize()
    let size = 1
    for (let i = 0; i < len && size < count; i++) {
      const key = generators.string(5)[1]
      const x = generate(--count - len, options)
      res[key] = x[1]
      size += x[0]
    }
    return [size, res]
  },

  string (bias = 50) {
    const len = rndSize(bias)
    const res = []
    for (let i = 0; i < len; i++) {
      res.push(rndChar())
    }
    return [1, res.join('')]
  },

  bytes (bias = 50) {
    const len = rndSize(bias)
    const res = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      res[i] = rndByte()
    }
    return [1, res]
  },

  boolean  () {
    return [1, Math.random() > 0.5]
  },

  integer () {
    return [1, Math.floor(Number.MAX_SAFE_INTEGER * Math.random()) * (Math.random() < 0.5 ? -1 : 1)]
  },

  float () {
    return [1, Math.tan((Math.random() - 0.5) * Math.PI)]
  },

  null () {
    return [1, null]
  },

  CID () {
    const hasher = hashes[Math.floor(Math.random() * hashes.length)]
    const codec = codecs[Math.floor(Math.random() * codecs.length)]
    const bytes = new Uint8Array(hasher[1] / 8)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = rndByte()
    }
    return [hasher[1], CID.create(1, codec, createDigest(hasher[0], bytes))]
  }
}

export default garbage
