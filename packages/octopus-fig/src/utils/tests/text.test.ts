import { _inferPostScriptType, inferPostScriptName } from '../text.js'

import type { InferPostScriptNameOptions } from '../text.js'

describe('_inferPostScriptType', () => {
  function testExample(fontWeight: number | undefined, result: string): void {
    test(`_inferPostScriptType(${fontWeight}) to be ${result}`, () => {
      expect(_inferPostScriptType(fontWeight)).toBe(result)
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
    [{ fontWeight: 700, italic: true }, null],
    [{ fontFamily: 'Arial', fontWeight: 700 }, 'Arial-Bold'],
    [{ fontFamily: 'Arial', fontWeight: 100 }, 'Arial-Thin'],
    [{ fontFamily: 'Arial', italic: true }, 'Arial-Italic'],
    [{ fontFamily: 'Arial', fontWeight: 700, italic: true }, 'Arial-BoldItalic'],
    [{ fontFamily: 'Arial', fontWeight: 100, italic: true }, 'Arial-ThinItalic'],
    [{ fontFamily: 'Arial', fontWeight: 700, italic: false }, 'Arial-Bold'],
    [{ fontFamily: 'Arial', fontWeight: 400, italic: true }, 'Arial-Italic'],
    [{ fontFamily: 'Avenir', fontStyle: 'Black', fontWeight: 400 }, 'Avenir-Black'],
    [{ fontFamily: 'Avenir', fontStyle: 'Black', fontWeight: 700, italic: true }, 'Avenir-Black'],
    [{ fontFamily: 'Avenir', fontStyle: 'Black', fontWeight: 200, italic: true }, 'Avenir-Black'],
    [{ fontFamily: 'Avenir', fontWeight: 700, italic: true }, 'Avenir-BoldItalic'],
  ]

  examples.forEach((example) => testExample(...example))
})
