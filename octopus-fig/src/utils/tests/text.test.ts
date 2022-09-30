import { describe, expect, test } from 'vitest'

import { _inferPostScriptType, inferPostScriptName } from '../text'

import type { InferPostScriptNameOptions } from '../text'

describe('_inferPostScriptType', () => {
  function testExample(weight: number | undefined, result: string): void {
    test(`_inferPostScriptType(${weight}) to be ${result}`, () => {
      expect(_inferPostScriptType(weight)).toBe(result)
    })
  }

  type Example = [number | undefined, string]
  const examples: Example[] = [
    [100, 'Thin'],
    [149, 'Thin'],
    [150, 'Thin'],
    [151, 'UltraLight'],
    [200, 'UltraLight'],
    [250, 'UltraLight'],
    [251, 'Light'],
    [300, 'Light'],
    [350, 'Light'],
    [351, 'Regular'],
    [400, 'Regular'],
    [450, 'Regular'],
    [451, 'Medium'],
    [500, 'Medium'],
    [550, 'Medium'],
    [551, 'Semibold'],
    [600, 'Semibold'],
    [650, 'Semibold'],
    [651, 'Bold'],
    [700, 'Bold'],
    [750, 'Bold'],
    [751, 'ExtraBold'],
    [800, 'ExtraBold'],
    [850, 'ExtraBold'],
    [851, 'Black'],
    [900, 'Black'],
    [0, 'Regular'],
    [undefined, 'Regular'],
    [999999999, 'Regular'],
  ]

  examples.forEach((example) => testExample(...example))
})

describe('inferPostScriptName', () => {
  function testExample(options: InferPostScriptNameOptions, result: string | null): void {
    test(`inferPostScriptName(${JSON.stringify(options)}) to be ${result}`, () => {
      expect(inferPostScriptName(options)).toBe(result)
    })
  }

  type Example = [InferPostScriptNameOptions, string | null]
  const examples: Example[] = [
    [{}, null],
    [{ fontFamily: 'Arial' }, 'Arial'],
    [{ weight: 700, italic: true }, null],
    [{ fontFamily: 'Arial', weight: 700 }, 'Arial-Bold'],
    [{ fontFamily: 'Arial', italic: true }, 'Arial-Italic'],
    [{ fontFamily: 'Arial', weight: 700, italic: true }, 'Arial-Bold-Italic'],
    [{ fontFamily: 'Arial', weight: 700, italic: false }, 'Arial-Bold'],
    [{ fontFamily: 'Arial', weight: 400, italic: true }, 'Arial-Italic'],
  ]

  examples.forEach((example) => testExample(...example))
})
