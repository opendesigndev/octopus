/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it, vi } from 'vitest'

import { OctopusLayerShapeShapeAdapter } from '../octopus-layer-shape-shape-adapter.js'

vi.mock('../octopus-layer-common', () => {
  return {
    __esModule: true,
    OctopusLayerCommon: vi.fn(),
  }
})

function getTestingOctopusLayerShapeShapeAdapter(sourceLayerProps?: Record<string, any>) {
  const options: any = {
    parent: {},
    layerSequence: {
      sourceLayers: [{ parentArtboard: { sourceDesign: { uniqueId: () => 1 } } }],
    },
  }

  const instance = new OctopusLayerShapeShapeAdapter(options)
  return Object.create(instance, { _sourceLayer: { value: sourceLayerProps ?? {} } })
}

describe('OctopusLayerShapeShapeAdapter', () => {
  describe('_normalizePoints', () => {
    it('creates array of NormalizedPoint from array of RawShapeLayerSubPathPoint', () => {
      const octopusLayerShapeShapeAdapter = getTestingOctopusLayerShapeShapeAdapter()

      const points = [
        { Coords: [1, 1, 3, 3], Type: 'Line' },
        { Coords: [2, 2, 7, 7, 15, 15], Type: 'Curve' },
        { Coords: [30, 30, 8, 8, 50, 50], type: 'Move' },
        { Coords: [4, 4, 100, 100, 60, 60], Type: 'Curve' },
      ]

      const expected = [
        {
          anchor: [1, 1],
          outBezier: [2, 2],
        },
        {
          anchor: [15, 15],
          inBezier: [7, 7],
          outBezier: [30, 30],
        },
        {
          anchor: [50, 50],
          inBezier: [8, 8],
          outBezier: [4, 4],
        },
        {
          anchor: [60, 60],
          inBezier: [100, 100],
        },
      ]

      expect(octopusLayerShapeShapeAdapter['_normalizePoints'](points)).toEqual(expected)
    })
  })

  describe('_createSubpathGeometry', () => {
    it('creates subpath geometry with closed path when subpath has truthy closed property', () => {
      const octopusLayerShapeShapeAdapter = getTestingOctopusLayerShapeShapeAdapter({ stroke: false })
      const points = [
        { Coords: [1, 1, 3, 3], Type: 'Line' },
        { Coords: [2, 2, 7, 7, 15, 15], Type: 'Curve' },
        { Coords: [2, 2, 7, 7, 15, 15], Type: '' },
        { Coords: [30, 30, 8, 8, 50, 50], type: 'Move' },
        { Coords: [30, 30, 8, 8, 50, 50], type: '' },
        { Coords: [4, 4, 100, 100, 60, 60], Type: 'Curve' },
      ]

      const subpath: any = { closed: true, points }
      expect(octopusLayerShapeShapeAdapter['_createSubpathGeometry'](subpath)).toEqual(
        'M1,1c1,1 6,6 14,14c-11,-11 85,85 45,45z'
      )
    })

    it('creates subpath geometry with closed path when stroke is not present on sourceLayer and closed property is nullish on subpath', () => {
      const octopusLayerShapeShapeAdapter = getTestingOctopusLayerShapeShapeAdapter({ stroke: false })
      const points = [
        { Coords: [1, 1, 3, 3], Type: 'Line' },
        { Coords: [2, 2, 7, 7, 15, 15], Type: 'Curve' },
        { Coords: [2, 2, 7, 7, 15, 15], Type: '' },
        { Coords: [30, 30, 8, 8, 50, 50], type: 'Move' },
        { Coords: [30, 30, 8, 8, 50, 50], type: '' },
        { Coords: [4, 4, 100, 100, 60, 60], Type: 'Curve' },
      ]

      const subpath: any = { closed: null, points }
      expect(octopusLayerShapeShapeAdapter['_createSubpathGeometry'](subpath)).toEqual(
        'M1,1c1,1 6,6 14,14c-11,-11 85,85 45,45z'
      )
    })

    it('creates subpath geometry with open path when closed property is false on subpath', () => {
      const octopusLayerShapeShapeAdapter = getTestingOctopusLayerShapeShapeAdapter({ stroke: false })
      const points = [
        { Coords: [1, 1, 3, 3], Type: 'Line' },
        { Coords: [2, 2, 7, 7, 15, 15], Type: 'Curve' },
        { Coords: [2, 2, 7, 7, 15, 15], Type: '' },
        { Coords: [30, 30, 8, 8, 50, 50], type: 'Move' },
        { Coords: [30, 30, 8, 8, 50, 50], type: '' },
        { Coords: [4, 4, 100, 100, 60, 60], Type: 'Curve' },
      ]

      const subpath: any = { closed: false, points }
      expect(octopusLayerShapeShapeAdapter['_createSubpathGeometry'](subpath)).toEqual(
        'M1,1c1,1 6,6 14,14c-11,-11 85,85 45,45'
      )
    })
  })

  describe('getPath', () => {
    it('returns null when sourceSubpaths on sourceLayer have 0 length', () => {
      const octopusLayerShapeShapeAdapter = getTestingOctopusLayerShapeShapeAdapter({ subpaths: [] })
      expect(octopusLayerShapeShapeAdapter.getPath()).toEqual(null)
    })

    it('returns octopus COMPOUND paths when sourceSubpaths on sourceLayer have >1 length', () => {
      const octopusLayerShapeShapeAdapter = getTestingOctopusLayerShapeShapeAdapter({
        subpaths: [
          {
            closed: true,
            points: [
              { Coords: [1, 1, 3, 3], Type: 'Line' },
              { Coords: [2, 2, 7, 7, 15, 15], Type: 'Curve' },
            ],
          },
          {
            closed: true,
            points: [
              { Coords: [1, 1, 3, 3], Type: 'Line' },
              { Coords: [2, 2, 7, 7, 15, 15], Type: 'Curve' },
            ],
          },
        ],
      })
      expect(octopusLayerShapeShapeAdapter.getPath()).toEqual({
        paths: [
          { geometry: 'M1,1c1,1 6,6 14,14z', type: 'PATH' },
          { geometry: 'M1,1c1,1 6,6 14,14z', type: 'PATH' },
        ],
        type: 'COMPOUND',
      })
    })

    it('returns octopus RECTANGLE when sourceSubpaths on sourceLayer have length=1 and type is Rect', () => {
      const octopusLayerShapeShapeAdapter = getTestingOctopusLayerShapeShapeAdapter({
        subpaths: [
          {
            type: 'Rect',
            closed: true,
            points: [
              { Coords: [1, 1], Type: 'Line' },
              { Coords: [2, 2], Type: 'Curve' },
            ],
          },
        ],
      })
      expect(octopusLayerShapeShapeAdapter.getPath()).toEqual({
        rectangle: { x0: 0, x1: 0, y0: 0, y1: 0 },
        type: 'RECTANGLE',
      })
    })

    it('returns octopus PATH path when sourceSubpaths on sourceLayer have length=1 and type is not Rect', () => {
      const octopusLayerShapeShapeAdapter = getTestingOctopusLayerShapeShapeAdapter({
        subpaths: [
          {
            points: [
              { Coords: [1, 1, 3, 3], Type: 'Line' },
              { Coords: [2, 2, 7, 7, 15, 15], Type: 'Curve' },
            ],
          },
        ],
      })
      expect(octopusLayerShapeShapeAdapter.getPath()).toEqual({ geometry: 'M1,1c1,1 6,6 14,14', type: 'PATH' })
    })
  })
})
