/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest'

import { SourceLayerXObjectForm } from '../../entities/source/source-layer-x-object-form.js'
import { createSoftMask, initClippingMask } from '../mask.js'

vi.mock('../../entities/source/source-layer-x-object-form')

describe('utils/mask', () => {
  describe('initClippingMask', () => {
    it('sets subpaths from clippingPaths', () => {
      const sourceLayerMask = {
        id: 1,
        subpaths: [{ id: '1-subpath' }, { id: '2-subpath' }],
        setSubpaths: function (subpaths: any[]) {
          this.subpaths = subpaths
        },
      }

      const layer = {
        clippingPaths: [
          sourceLayerMask,
          { id: 2, subpaths: [{ id: '3-subpath' }, { id: '4-subpath' }] },
          { id: 3, subpaths: [{ id: '5-subpath' }] },
        ],
      }

      const mask = initClippingMask(layer as any)
      expect(mask?.subpaths).toEqual([
        { id: '1-subpath' },
        { id: '2-subpath' },
        { id: '3-subpath' },
        { id: '4-subpath' },
        { id: '5-subpath' },
      ])
    })

    it('returns void when layer type is Shading', () => {
      const sourceLayerMask = {
        id: 1,
        subpaths: [{ id: '1-subpath' }, { id: '2-subpath' }],
        setSubpaths: function (subpaths: any[]) {
          this.subpaths = subpaths
        },
      }
      const layer = {
        type: 'Shading',
        clippingPaths: [
          sourceLayerMask,
          { id: 2, subpaths: [{ id: '3-subpath' }, { id: '4-subpath' }] },
          { id: 3, subpaths: [{ id: '5-subpath' }] },
        ],
      }

      expect(initClippingMask(layer as any)).toEqual(undefined)
    })

    it('returns void when layer has no clippingPaths', () => {
      const layer = {}

      expect(initClippingMask(layer as any)).toEqual(undefined)
    })

    it('returns void when layer has empty array for clippingPaths', () => {
      const layer = {
        clippingPaths: [],
      }

      expect(initClippingMask(layer as any)).toEqual(undefined)
    })
  })

  describe('createSoftMask', () => {
    it('returns null if "G"  is not present in mask', () => {
      const sMask = {}
      const parent = {}

      expect(createSoftMask({ sMask, parent } as any)).toEqual(null)
    })

    it('returns null if  there is no "Subtype" in "G"  is not present in mask', () => {
      const sMask = { G: {} }
      const parent = {}

      expect(createSoftMask({ sMask, parent } as any)).toEqual(null)
    })

    it('returns null if  there is "Subtype" in "G" and is not "Form"  ', () => {
      const sMask = { G: { Subtype: 'notForm' } }
      const parent = {}

      expect(createSoftMask({ sMask, parent } as any)).toEqual(null)
    })

    it('returns new instance from SourceLayerXObjectForm', () => {
      const sMask = { G: { Subtype: 'Form' } }
      const parent = {}

      const instance = {}

      vi.mocked(SourceLayerXObjectForm).mockReturnValueOnce(instance as any)
      expect(createSoftMask({ sMask, parent: parent } as any)).toBe(instance)
    })
  })
})
