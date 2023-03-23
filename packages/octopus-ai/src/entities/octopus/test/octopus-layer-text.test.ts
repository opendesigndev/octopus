/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest'

import { TextLayerGroupingservice } from '../../../services/conversion/text-layer-grouping-service/index.js'
import { OctopusLayerText } from '../octopus-layer-text.js'

vi.mock('../octopus-layer-common', () => {
  return {
    __esModule: true,
    OctopusLayerCommon: vi.fn(),
  }
})
describe('OctopusLayerText', () => {
  describe('._getLineHeight', () => {
    const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
    const parent = {}
    const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)

    it('returns prevLineHeight when currentTy is falsy', () => {
      expect(octopusLayerText['_getLineHeight'](1, null, 2)).toEqual(1)
    })

    it('returns prevLineHeight when prevTy is falsy', () => {
      expect(octopusLayerText['_getLineHeight'](1, 2, null)).toEqual(1)
    })

    it('returns prevLineHeight when currentTy - prevTy is less than OctopusLayerText.MIN_LINE_HEIGHT', () => {
      expect(octopusLayerText['_getLineHeight'](15, 100, 100 - OctopusLayerText.MIN_LINE_HEIGHT + 1)).toEqual(15)
    })

    it('returns new lineHeight', () => {
      const expected = 100 - (100 - OctopusLayerText.MIN_LINE_HEIGHT - 1)
      expect(octopusLayerText['_getLineHeight'](15, 100, 100 - OctopusLayerText.MIN_LINE_HEIGHT - 1)).toEqual(expected)
    })
  })

  describe('._getSubtextsWithLineHeights', () => {
    const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
    const parent = {}
    const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)

    it('returns octopusSubtexts as is, if _getLineHeight returns falsy', () => {
      const octopusSubtexts: any = [
        { id: 1, defaultStyle: {} },
        { id: 2, defaultStyle: {} },
      ]

      expect(octopusLayerText['_getSubtextsWithLineHeights'](octopusSubtexts)).toEqual(octopusSubtexts)
    })

    it('returns octopusSubtexts with lineHeights if _getLineHeight returns value', () => {
      const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
      const parent = {}
      const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)

      const _getLineHeightMock = vi.fn()
      vi.mocked(_getLineHeightMock).mockReturnValueOnce(null)
      vi.mocked(_getLineHeightMock).mockReturnValueOnce(10)
      octopusLayerText['_getLineHeight'] = _getLineHeightMock

      const subtext1: any = { id: 1, defaultStyle: {} }
      const subtext2: any = { id: 2, defaultStyle: {} }
      subtext1.transform = Array.from(Array(6))

      subtext1.transform[5] = 10
      subtext2.transform = Array.from(Array(6))
      subtext2.transform[5] = 11

      const octopusSubtexts: any = [subtext1, subtext2]
      const expectedValue = [subtext1, { ...subtext2, defaultStyle: { lineHeight: 10 } }]

      expect(octopusLayerText['_getSubtextsWithLineHeights'](octopusSubtexts)).toEqual(expectedValue)
      expect(_getLineHeightMock).toHaveBeenCalledWith(null, 11, 10)
    })
  })

  describe('._getOctopusTextSliceLength', () => {
    it('returns null when _octopusTextValue is falsy', () => {
      const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
      const parent = {}
      const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)

      expect(octopusLayerText['_getOctopusTextSliceLength']('hello')).toEqual(null)
    })

    it('returns length of passed in subtext when it matches begginning of octopusTextSlice', () => {
      const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
      const parent = {}
      const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)
      octopusLayerText['_octopusTextValue'] = 'hello world'
      expect(octopusLayerText['_getOctopusTextSliceLength']('hello')).toEqual(5)
    })

    it('returns length of passed in subtext when it matches begginning of octopusTextSlice but has hyphen', () => {
      const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
      const parent = {}
      const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)
      octopusLayerText['_octopusTextValue'] = 'hello world'
      expect(octopusLayerText['_getOctopusTextSliceLength']('hello-')).toEqual(5)
    })

    it('returns 0 when subtext is hyphen ', () => {
      const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
      const parent = {}
      const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)
      octopusLayerText['_octopusTextValue'] = 'hello'
      expect(octopusLayerText['_getOctopusTextSliceLength']('-')).toEqual(0)
    })

    it('returns 0 when subtext is hyphen ', () => {
      const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
      const parent = {}
      const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)
      octopusLayerText['_octopusTextValue'] = 'hello'
      expect(octopusLayerText['_getOctopusTextSliceLength']('-')).toEqual(0)
    })

    it('returns +1 length when _octopusTextValue has extra special character at the end', () => {
      const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
      const parent = {}
      const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)
      octopusLayerText['_octopusTextValue'] = 'hello' + TextLayerGroupingservice.OCTOPUS_EXTRA_CHARACTERS[0] + 'world'
      expect(octopusLayerText['_getOctopusTextSliceLength']('hello')).toEqual(6)
    })
  })

  describe('._getOctopusTextSlice', () => {
    it('returns remaining _octopusTextValue when isLast property is truthy', () => {
      const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
      const parent = {}
      const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)
      const expected = 'hello world'
      octopusLayerText['_octopusTextValue'] = expected

      expect(octopusLayerText['_getOctopusTextSlice']('randomString', true)).toEqual(expected)
    })

    it('returns undefined when _getOctopusTextSliceLength returns null', () => {
      const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
      const parent = {}
      const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)
      octopusLayerText['_octopusTextValue'] = 'somestring'

      const _getOctopusTextSliceLengthMock = vi.fn()
      octopusLayerText['_getOctopusTextSliceLength'] = _getOctopusTextSliceLengthMock
      vi.mocked(_getOctopusTextSliceLengthMock).mockReturnValueOnce(null)

      expect(octopusLayerText['_getOctopusTextSlice']('randomString', false)).toEqual(undefined)
      expect(_getOctopusTextSliceLengthMock).toHaveBeenCalledWith('randomString')
    })

    it('returns slice from octopusTextValue when _getOctopusTextSliceLength returns number', () => {
      const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
      const parent = {}
      const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)
      octopusLayerText['_octopusTextValue'] = 'somestring'

      const _getOctopusTextSliceLengthMock = vi.fn()
      octopusLayerText['_getOctopusTextSliceLength'] = _getOctopusTextSliceLengthMock
      vi.mocked(_getOctopusTextSliceLengthMock).mockReturnValueOnce(4)

      expect(octopusLayerText['_getOctopusTextSlice']('some', false)).toEqual('some')
      expect(octopusLayerText['_octopusTextValue']).toEqual('string')
    })
  })

  describe('._parseText', () => {
    it('merges subtexts into 1', () => {
      const layerSequence = { additionalTextDataText: [], sourceLayers: [] }
      const parent = {}
      const octopusLayerText = new OctopusLayerText({ layerSequence, parent } as any)
      octopusLayerText['_octopusSubTexts'] = [
        { value: 'abc', defaultStyle: { postScriptName: 'arial' } },
        { value: 'def', defaultStyle: { postScriptName: 'timesNewRoman' } },
        { value: 'ghj', defaultStyle: { postScriptName: 'montserrat' } },
      ] as any

      const _getOctopusTextSliceMock = vi.fn()
      octopusLayerText['_getOctopusTextSlice'] = _getOctopusTextSliceMock

      vi.mocked(_getOctopusTextSliceMock).mockReturnValueOnce('abc')
      vi.mocked(_getOctopusTextSliceMock).mockReturnValueOnce('def')
      vi.mocked(_getOctopusTextSliceMock).mockReturnValueOnce('ghj')

      expect(octopusLayerText['_parseText']()).toEqual({
        defaultStyle: { postScriptName: 'arial' },
        styles: [
          { ranges: [{ from: 0, to: 3 }], style: { postScriptName: 'arial' } },
          { ranges: [{ from: 3, to: 6 }], style: { postScriptName: 'timesNewRoman' } },
          { ranges: [{ from: 6, to: 9 }], style: { postScriptName: 'montserrat' } },
        ],
        value: 'abcdefghj',
      })

      expect(_getOctopusTextSliceMock).toHaveBeenNthCalledWith(3, 'ghj', true)
    })
  })
})
