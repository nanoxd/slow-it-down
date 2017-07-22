export const xor = (...args: any[]): boolean => {
  let x = 0

  args.forEach(arg => {
    x ^= ~~arg
  })

  return x > 0
}
