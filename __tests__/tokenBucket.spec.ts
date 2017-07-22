import { TokenBucket } from '../src/tokenBucket'

jest.useFakeTimers()

describe('TokenBucket', () => {
  it('should initialize with options', () => {
    const bucket = new TokenBucket({ capacity: 20, fillRate: 1 })

    expect(bucket.capacity).toBe(20)
    expect(bucket.tokens).toBe(20)
    expect(bucket.fillRate).toBe(1)
  })

  describe('consume', () => {
    it('should consume a token when there is capacity', () => {
      const bucket = new TokenBucket({ capacity: 20, fillRate: 1 })
      expect(bucket.consume(1)).toBe(true)
    })

    it('should consume a token when there is no capacity', () => {
      const bucket = new TokenBucket({ capacity: 20, fillRate: 1 })
      expect(bucket.consume(21)).toBe(false)
    })
  })

  describe('refills', () => {
    it('should refill tokens', () => {
      const bucket = new TokenBucket({ capacity: 20, fillRate: 100 })
      expect(bucket.consume(20)).toBe(true)

      setTimeout(() => {
        expect(bucket.consume(20)).toBe(true)
      }, 105)
    })

    it('should not consume a token before it is refilled', () => {
      const slowerBucket = new TokenBucket({ capacity: 10, fillRate: 1000 })

      expect(slowerBucket.consume(10)).toBe(true)
      expect(slowerBucket.tokens).toBe(0)
      setTimeout(() => {
        expect(slowerBucket.consume(10)).toBe(false)
      }, 300)
    })
  })
})
