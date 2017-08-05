export interface TokenBucketOptions {
  /**
   * Maximum number of tokens to hold in the bucket
   * 
   * @type {number}
   */
  capacity: number
  /**
   * Number of tokens to fill the bucket over the course of an interval
   * 
   * @type {number}
   */
  fillRate: number
}

/**
 * Token Bucket Algorithm used in network throttling.
 * 
 * See https://en.wikipedia.org/wiki/Token_bucket for more information
 */
export class TokenBucket {
  capacity: number
  fillRate: number
  tokens: number

  private time: number

  constructor(options: TokenBucketOptions) {
    this.tokens = this.capacity = options.capacity
    this.fillRate = options.fillRate
    this.time = Date.now()
  }

  /**
 * Consume N tokens from the bucket.
 *
 * If there is no capacity, the tokens are not pulled from the bucket.
 *
 * @param {Number} tokens the number of tokens to remove.
 * @return {Boolean} True if there were enough tokens, otherwise false.
 */
  consume(tokens: number): boolean {
    if (tokens <= this.fill()) {
      this.tokens -= tokens
      return true
    }

    return false
  }

  /**
   * Fills the bucket with more tokens.
   * 
   * @return {Number} the current number of tokens in the bucket
   */
  private fill(): number {
    const now = Date.now()

    // Account for clock drift
    if (now < this.time) {
      this.time = now - 1000
    }

    if (this.tokens < this.capacity) {
      const delta = this.fillRate * ((now - this.time) / 1000)
      this.tokens = Math.min(this.capacity, this.tokens + delta)
    }

    this.time = now

    return this.tokens
  }
}
