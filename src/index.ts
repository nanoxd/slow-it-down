import { format } from 'util'
import { Netmask } from 'netmask'
import { xor } from './xor'

import { TokenBucket } from './tokenBucket'
import TokenTable, { TokenStorageEngine } from './tokenTable'

export type Maybe<T> = T | undefined

export const hasValues = (
  ip: Maybe<boolean>,
  xff: Maybe<boolean>,
  user: Maybe<boolean>
): boolean => {
  return xor(ip, xff, user)
}

export const isNetBlock = (mask: Netmask): boolean => {
  return mask.first !== mask.last
}

export const handleNetmasks = (overrides: any): any => {
  for (let key in overrides) {
    let override = overrides[key]

    try {
      const block = new Netmask(key)

      if (isNetBlock(block)) {
        override.block = block
      }
    } catch (err) {}
  }

  return overrides
}

export interface ThrottleOptions {
  burst: number
  rate: number
  ip?: boolean
  user?: boolean
  xff?: boolean
  overrides?: any
  tokensTable?: TokenStorageEngine<TokenBucket>
  maxKeys?: number
  message?: string
}

export const throttle = (options: ThrottleOptions): any => {
  if (!hasValues(options.ip, options.xff, options.user)) {
    throw new Error('(ip ^ username ^ xff)')
  }

  if (options.overrides) {
    options.overrides = handleNetmasks(options.overrides)
  }

  const message =
    options.message || 'You have exceeded your request rate of %s r/s.'
  const size = options.maxKeys || 10000
  const table = options.tokensTable || new TokenTable({ size })

  const rateLimit = (req: any, res: any, next: any): any => {
    let { burst, rate } = options
    let attr: Maybe<string>

    if (options.ip) {
      attr = req.connection.remoteAddress
    } else if (options.xff) {
      attr = req.headers['x-forwarded-for']
    } else if (options.user) {
      attr = req.user
    }

    // Check if request matches
    if (!attr) {
      return next(new Error('Invalid throttle configuration'))
    }

    attr = attr.split(',')[0]

    // Check overrides
    if (options.overrides) {
      let override = options.overrides[attr]

      if (
        override &&
        override.burst !== undefined &&
        override.rate !== undefined
      ) {
        burst = override.burst
        rate = override.rate
      } else {
        for (let key in options.overrides) {
          override = options.overrides[key]
          let contained = false

          try {
            contained = override.block && override.block.contains(attr)
          } catch (err) {
            // Ignore
          }

          if (contained) {
            burst = override.burst
            rate = override.rate
            break
          }
        }
      }
    }

    if (!rate || !burst) {
      return next()
    }

    let bucket = table.get(attr)
    if (!bucket) {
      bucket = new TokenBucket({
        capacity: burst,
        fillRate: rate,
      })
    }
  }
}

export default throttle
