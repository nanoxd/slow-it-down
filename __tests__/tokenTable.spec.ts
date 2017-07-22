import TokenTable from '../src/tokenTable'

describe('TokenTable', () => {
  it('should adhere to size', () => {
    const table = new TokenTable<string>({ size: 1 })
    const item = 'one'
    const newItem = 'two'

    table.put('key', item)
    expect(table.get('key')).toBe(item)

    table.put('otherKey', newItem)
    expect(table.get('key')).toBeUndefined()
    expect(table.get('otherKey')).toBe(newItem)
  })

  describe('get/set', () => {
    let table: TokenTable<string>

    beforeAll(() => {
      table = new TokenTable()
    })

    it('should retrieve an item when set', () => {
      const item = 'dexter'
      table.put('key', item)

      expect(table.get('key')).toBe(item)
    })

    it('should be undefined when key is not present', () => {
      expect(table.get('missing')).toBeUndefined()
    })
  })
})
