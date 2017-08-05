# slow-it-down

A rate limiter for Express written in TypeScript.

## Usage

```js
const slowDown = require('slow-it-down')
const app = express()

app.use(slowDown({
  burst: 25, // Maxiumum number of concurrent requests
  rate: 1, // 1 requests/second
}))
```

#### `slowDown(config)`

Creates a new rate limiter, accepts the following:

| name | default | type | description |
| ---- | ----------- | ------- | ----- |
| burst |  - | number | Number of requests a user can have |
| rate |  - | number | Rate at which those requests refill |
| ip   | true | boolean | Throttle on IP |
| user | false | boolean | Throttle using `user` on `req`
| xff | false | boolean | Throttle using X-Forwarded-For |
| overrides | - | object | Overrides for individual keys |
| tokensTable | tokenBucket | Object | In-memory storage engine |
| maxKeys | 10000 | number | Maximum distinct throttling keys |


## Testing

`yarn test`
