import { format } from 'util'
import { Netmask } from 'netmask'
import { xor } from './xor'
import express from 'express'

import { TokenBucket } from './tokenBucket'
import TokenTable, { TokenStorageEngine } from './tokenTable'

declare const Set: any
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

export interface Configuration {
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

/**
 * Express middleware that requires an Options object containing
 * at least a burst and rate property.
 * 
 * @example 
 * throttle({
 *   burst: 10,
 *   rate: 1,
 *   ip: true,
 * })
 * 
 * @param {Configuration} options 
 * @returns {*} 
 */
const slowDown = (config: Configuration): any => {
  if (!hasValues(config.ip, config.xff, config.user)) {
    throw new Error('(ip ^ username ^ xff)')
  }

  if (config.overrides) {
    config.overrides = handleNetmasks(config.overrides)
  }

  const message =
    config.message || 'You have exceeded your request rate of %s r/s.'
  const size = config.maxKeys || 10000
  const table = config.tokensTable || new TokenTable({ size })

  const rateLimit = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): any => {
    let { burst, rate } = config
    let attr: Maybe<string>

    if (config.ip) {
      attr = req.connection.remoteAddress
    } else if (config.xff) {
      const xffHeader = req.headers['x-forwarded-for']

      if (xffHeader instanceof Array) {
        attr = xffHeader[0]
      } else {
        attr = xffHeader
      }
    } else if (config.user) {
      attr = (req as any).user
    }

    // Check if request matches
    if (!attr) {
      return next(new Error('Invalid throttle configuration'))
    }

    attr = attr.split(',')[0]

    // Check overrides
    if (config.overrides) {
      let override = config.overrides[attr]

      if (
        override &&
        override.burst !== undefined &&
        override.rate !== undefined
      ) {
        burst = override.burst
        rate = override.rate
      } else {
        for (let key in config.overrides) {
          override = config.overrides[key]
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

      table.put(attr, bucket)
    }

    if (!bucket.consume(1)) {
      const msg = format(message, rate)
      const err: any = new Error(msg)
      err.status = 429

      return next(err)
    }

    return next()
  }

  return rateLimit
}

export default slowDown
