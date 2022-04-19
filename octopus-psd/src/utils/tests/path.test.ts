import { isRectangle } from '../path'

import type { Points } from '../path'

describe('isRectangle', () => {
  function testIsRectangle(points: Points, result: boolean): void {
    test(`isRectangle( ${JSON.stringify(points)} ) to be ${result}`, () => {
      expect(isRectangle(points)).toBe(result)
    })
  }

  type Example = [Points, boolean]
  const examples: Example[] = [
    [[], false],
    [[{ x: 0, y: 0 }], false],
    [
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      true,
    ],
    [
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      true,
    ],
    [
      [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ],
      false,
    ],
    [
      [
        { x: 1, y: 0 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 0, y: 1 },
      ],
      false,
    ],
  ]

  examples.forEach((example) => testIsRectangle(...example))
})
