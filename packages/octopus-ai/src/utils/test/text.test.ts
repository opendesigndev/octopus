import { removeTrailingHyphen } from '../text'

describe('utils/text', () => {
  describe('removeTrailingHyphen', () => {
    it('removes trailing hyphen', () => {
      const text = 'ab-c--'
      const expected = 'ab-c-'

      expect(removeTrailingHyphen(text)).toEqual(expected)
    })
  })
})
