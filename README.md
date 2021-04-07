# ipld-garbage

Generate garbage objects conformant with the [IPLD Data Model](https://docs.ipld.io/#the-data-model). Useful for fuzzing.

Based on [substack's "garbage"](https://github.com/substack/node-garbage).

## API

`garbage(count = 200, options)`

Where `count` determines the approximate target number of bytes a garbage object should consume. And `options` allows for a `weight` object that allows you to provide a number for each object type to weight the random garbage generator. By default, all object types are weighted equally (with a value of `1`), providing a number (>= `0`), you can adjust the liklihood that particular types will appear relative to the weights of the other types. A weighting of `0` will turn off that type entirely.

### `options`

  * `options.weights` an object with properties matching the IPLD data model types (see below) with numbers (>= `0`) that will weight randomness selection. Default: `{ list: 1, map: 1, string: 1, bytes: 1, boolean: 1, integer: 1, float: 1, null: 1, CID: 1 }`.
  * `options.initialWeights` an object, similar to `options.weights`, that only applies to the initial object. Subsequent object creation will use `options.weights`. This allows for weighting of the container object to be more typical of IPLD data, which is typically some kind of map or list. Default `{ list: 10, map: 10, string: 1, bytes: 1, boolean: 1, integer: 1, float: 1, null: 1, CID: 1 }`.

Where you provide a custom `weights`, it will override `initialWeights`. e.g. `{ weights: { float: 0 } }` will result in no floats at all, even for the initial object.

```js
import { garbage } from 'ipld-garbage'

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

* null
* boolean
* integer
* float
* string
* bytes
* list
* map
* CID

Use `import { toString } from 'ipld-garbage/to-string'` to import a function that can turn an object returned by `garbage()` to a JavaScript string. This may be useful for generating a fixed set of test fixtures rather than relying on randomness during each run.

## License and Copyright

Copyright 2020 Rod Vagg

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
