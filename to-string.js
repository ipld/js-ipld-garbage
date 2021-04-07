import { CID } from 'multiformats/cid'

/**
 * @param {any} obj
 * @returns {string}
 */
export function toString (obj) {
  if (CID.asCID(obj)) {
    return `CID.parse('${obj.toString()}')`
  }
  if (obj === null) {
    return 'null'
  }
  const typ = typeof obj
  if (typ === 'string') {
    return `'${JSON.stringify(obj).replace(/^"|"$/g, '').replace(/'/g, '\\\'')}'`
  }
  if (typ === 'number' || typ === 'boolean') {
    return String(obj)
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(toString).join(',')}]`
  }
  if (obj instanceof Uint8Array) {
    return `Uint8Array.from([${obj.join(',')}])`
  }
  if (typ === 'object') {
    const props = Object.entries(obj).map(([key, value]) => {
      return `[${toString(key)}]: ${toString(value)}`
    })
    return `{${props.join(',')}}`
  }
  throw new Error(`Invalid IPLD kind: ${Object.prototype.toString.call(obj)}`)
}

// console.log(toString(garbage(100, { weights: { list: 0 } })))
