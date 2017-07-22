import { xor } from '../src/xor'

describe('xor', () => {
  it('should evaluate true true to false', () => {
    expect(xor(true, true)).toBe(false)
  })

  it('should evaluate false false to false', () => {
    expect(xor(false, false)).toBe(false)
  })

  it('should evaluate true false to true', () => {
    expect(xor(true, false)).toBe(true)
  })

  it('should evaluate false true to true', () => {
    expect(xor(false, true)).toBe(true)
  })

  it('should evaluate true true false to false', () => {
    expect(xor(true, true, false)).toBe(false)
  })

  it('should evalaute false true false to true', () => {
    expect(xor(false, true, false)).toBe(true)
  })
})
