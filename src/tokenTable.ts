import * as LRU from 'lru-cache'
import { Maybe } from './index'

export interface TokenTableOptions {
  size: number
}

export interface TokenStorageEngine<T> {
  get(key: any): Maybe<T>
  put(key: any, value: T): void
}

/**
 * A cache to hold onto tokens
 * 
 * @class TokenTable
 * @template Value 
 */
class TokenTable<Value> implements TokenStorageEngine<Value> {
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
