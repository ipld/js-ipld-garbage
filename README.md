# @ipld/garbage <!-- omit in toc -->

[![codecov](https://img.shields.io/codecov/c/github/ipld/js-ipld-garbage.svg?style=flat-square)](https://codecov.io/gh/ipld/js-ipld-garbage)
[![CI](https://img.shields.io/github/workflow/status/ipld/js-ipld-garbage/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/ipld/js-ipld-garbage/actions/workflows/js-test-and-release.yml)

> Garbage data generator for the IPLD Data Model

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [API](#api)
  - [`options`](#options)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i @ipld/garbage
```

Based on [substack's "garbage"](https://github.com/substack/node-garbage).

## API

`garbage(count = 200, options)`

Where `count` determines the approximate target number of bytes a garbage object should consume. And `options` allows for a `weight` object that allows you to provide a number for each object type to weight the random garbage generator. By default, all object types are weighted equally (with a value of `1`), providing a number (>= `0`), you can adjust the liklihood that particular types will appear relative to the weights of the other types. A weighting of `0` will turn off that type entirely.

### `options`

- `options.weights` an object with properties matching the IPLD data model types (see below) with numbers (>= `0`) that will weight randomness selection. Default: `{ list: 1, map: 1, string: 1, bytes: 1, boolean: 1, integer: 1, float: 1, null: 1, CID: 1 }`.
- `options.initialWeights` an object, similar to `options.weights`, that only applies to the initial object. Subsequent object creation will use `options.weights`. This allows for weighting of the container object to be more typical of IPLD data, which is typically some kind of map or list. Default `{ list: 10, map: 10, string: 1, bytes: 1, boolean: 1, integer: 1, float: 1, null: 1, CID: 1 }`.

Where you provide a custom `weights`, it will override `initialWeights`. e.g. `{ weights: { float: 0 } }` will result in no floats at all, even for the initial object.

```js
import { garbage } from '@ipld/garbage'

console.log(garbage(100, { weights: { float: 0, object: 0 }}))
```

Might yield:

```js
{
  'QbN/}`EO\tb6>\tI,`': 7827882605575541,
  "~'wD!☺S}<Q|d1$☺": Uint8Array(12) [
    116,  12, 191, 180, 214,
      0,  88,  26, 116, 213,
     88, 109
  ],
  'q<': CID(baguqefrapdjrz7rknhnokqxo75ogs2hfpmdqiy7weez55ezaoyh63sd22n4q)
}
```

All IPLD Data Model types are within range for random creation, including top-level returns (a single call to `garbage()` might just return a `null`):

- null
- boolean
- integer
- float
- string
- bytes
- list
- map
- CID

Use `import { toString } from '@ipld/garbage/to-string'` to import a function that can turn an object returned by `garbage()` to a JavaScript string. This may be useful for generating a fixed set of test fixtures rather than relying on randomness during each run.

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
