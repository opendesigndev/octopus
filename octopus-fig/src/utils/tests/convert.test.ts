import { convertId } from '../convert'

describe('convertId', () => {
  function testConvertId(id: string, result: string): void {
    test(`convertId(${id}) to be ${result}`, () => {
      expect(convertId(id)).toBe(result)
    })
  }

  type Example = [string, string]
  const examples: Example[] = [
    ['1:22:333:4444', '1-22-333-4444'],
    ['1;22;333;4444', '1_22_333_4444'],
    ['1:22;333:4444', '1-22_333-4444'],
    ['1;22-333;4444', '1_22-333_4444'],
    ['1:22;333-Background', '1-22_333-Background'],
    ['1:22;333:Background', '1-22_333-Background'],
    ['1:22;333_Background', '1-22_333_Background'],
    ['1:22;333;Background', '1-22_333_Background'],
  ]

  examples.forEach((example) => testConvertId(...example))
})
