// based on https://github.com/substack/node-garbage/blob/master/index.js
import { CID } from 'multiformats/cid'
import { create as createDigest } from 'multiformats/hashes/digest'

const kinds = ['list', 'map', 'string', 'bytes', 'boolean', 'integer', 'float', 'null', 'CID']
const codecs = [0x55, 0x70, 0x71, 0x0129]
const hashes = [[0x12, 256], [0x16, 256], [0x1b, 256], [0xb220, 256], [0x13, 512], [0x15, 384], [0x14, 512]]
const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()-_=+[]{}|\\:;\'",.<>?/ \t\n\u263a'
const baseOptions = { initialWeights: { map: 10, list: 10 } }
/**
 * @param {number} [count=200]
 * @param {import('./interface.js').GarbageOptions} [options]
 * @returns {any}
 */
export function garbage (count = 200, options) {
  options = Object.assign({}, baseOptions, options)
  return generate(count, options)[1]
}

/**
 * @param {number} count
 * @param {import('./interface.js').GarbageOptions} options
 * @returns {any}
 */
function generate (count, options) {
  let totWeight = 0
  const weights = Object.assign({}, options.initialWeights, options.weights || {})
  if (options.initialWeights) {
    options = Object.assign(options, { initialWeights: null })
  }
  const types = kinds.map((t) => {
    /* c8 ignore next 5 */
    // @ts-ignore not sure why I can't index with [t] from a fixed list of properties
    const weight = weights && typeof weights[t] === 'number' ? weights[t] : 1
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
    wacc += /** @type {number } */(weight)
    if (wacc >= rnd) {
      // @ts-ignore not sure why I can't index with [t] from a fixed list of properties
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
  /**
   * @param {number} count
   * @param {import('./interface.js').GarbageOptions} options
   * @returns {[number, Array<any>]}
   */
  list (count, options) {
    const res = []
    const len = rndSize()
    let size = 0
    for (let i = 0; i < len && size < count; i++) {
      const x = generate(count - size, options)
      res.push(x[1])
      size += x[0]
    }
    return [size, res]
  },

  /**
   * @param {number} count
   * @param {import('./interface.js').GarbageOptions} options
   * @returns {[number, {[key: string]: any}]}
   */
  map (count, options) {
    /** @type {{[key: string]: any}} */
    const res = {}
    const len = rndSize()
    let size = 0
    for (let i = 0; i < len && size < count; i++) {
      const key = /** @type {keyof typeof res} */ generators.string(5)[1]
      const x = generate(count - size, options)
      res[key] = x[1]
      size += x[0] + key.length
    }
    return [size, res]
  },

  /**
   * @param {number} [bias=50]
   * @returns {[number, string]}
   */
  string (bias = 50) {
    const len = rndSize(bias)
    const res = []
    for (let i = 0; i < len; i++) {
      res.push(rndChar())
    }
    return [len, res.join('')]
  },

  /**
   * @param {number} [bias=50]
   * @returns {[number, Uint8Array]}
   */
  bytes (bias = 50) {
    const len = rndSize(bias)
    const res = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      res[i] = rndByte()
    }
    return [len, res]
  },

  /**
   * @returns {[1, boolean]}
   */
  boolean  () {
    return [1, Math.random() > 0.5]
  },

  /**
   * @returns {[1, number]}
   */
  integer () {
    return [1, Math.floor(Number.MAX_SAFE_INTEGER * Math.random()) * (Math.random() < 0.5 ? -1 : 1)]
  },

  /**
   * @returns {[1, number]}
   */
  float () {
    return [1, Math.tan((Math.random() - 0.5) * Math.PI)]
  },

  /**
   * @returns {[1, null]}
   */
  null () {
    return [1, null]
  },

  /**
   * @returns {[number, CID]}
   */
  CID () {
    const hasher = hashes[Math.floor(Math.random() * hashes.length)]
    const codec = codecs[Math.floor(Math.random() * codecs.length)]
    const bytes = new Uint8Array(hasher[1] / 8)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = rndByte()
    }
    return [bytes.length, CID.create(1, codec, createDigest(hasher[0], bytes))]
  }
}
