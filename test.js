import { garbage } from 'ipld-garbage'
import is from '@sindresorhus/is'

const expectedTypes = ['null', 'boolean', 'int', 'float', 'string', 'Uint8Array', 'Array', 'Object', 'CID']

/** @type {Record<string, number>} */
const types = {}
/**
 * @param {any} obj
 * @returns {string}
 */
const account = (obj) => {
  /** @type {string} */
  let type = is(obj)
  if (type === 'Object' && obj.asCID === obj) {
    type = 'CID'
  } else if (type === 'number') {
    type = Number.isInteger(obj) ? 'int' : 'float'
  }
  types[type] = (types[type] || 0) + 1
  return type
}
for (let i = 0; i < 1000; i++) {
  const obj = garbage()
  const type = account(obj)
  // just look one level deep
  if (type === 'Object') {
    for (const value of Object.values(obj)) {
      account(value)
    }
  } else if (type === 'Array') {
    for (const value of obj) {
      account(value)
    }
  }
}

for (const type of expectedTypes) {
  if (!types[type]) {
    throw new Error(`Did not generate any ${type} values`)
  }
  if (types[type] < 20) {
    throw new Error(`Did not generate enough ${type} values`)
  }
}
for (const type of Object.keys(types)) {
  if (!expectedTypes.includes(type)) {
    throw new Error(`Got unexpected type ${type}`)
  }
}

console.log('\u001b[32m✔\u001b[39m yep')
