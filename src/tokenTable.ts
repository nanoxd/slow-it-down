import * as LRU from 'lru-cache'

export interface TokenTableOptions {
  size: number
}

export type Maybe<T> = T | undefined

/**
 * A cache to hold onto tokens
 * 
 * @class TokenTable
 * @template Value 
 */
class TokenTable<Value> {
  private table: LRU.Cache<Value>

  constructor(options: TokenTableOptions = { size: 10000 }) {
    this.table = LRU(options.size)
  }

  get(key: any): Maybe<Value> {
    return this.table.get(key)
  }

  put(key: any, value: Value): void {
    this.table.set(key, value)
  }
}

export default TokenTable
