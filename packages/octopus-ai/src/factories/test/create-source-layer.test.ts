/* eslint-disable @typescript-eslint/no-explicit-any */

import { mocked } from 'jest-mock'

import { SourceLayerGroup } from '../../entities/source/source-layer-group.js'
import { SourceLayerShape } from '../../entities/source/source-layer-shape.js'
import { SourceLayerText } from '../../entities/source/source-layer-text.js'
import { SourceLayerXObjectForm } from '../../entities/source/source-layer-x-object-form.js'
import { SourceLayerXObjectImage } from '../../entities/source/source-layer-x-object-image.js'
import { createSourceLayer } from '../create-source-layer.js'

jest.mock('../../entities/source/source-layer-shape')
jest.mock('../../entities/source/source-layer-text')
jest.mock('../../entities/source/source-layer-group')
jest.mock('../../entities/source/source-layer-x-object-image')
jest.mock('../../entities/source/source-layer-x-object-form')

describe('createSourcLayer', () => {
  it('returns null when rawLayer has no corresponding Type', () => {
    const rawLayer = { Type: 'someStrangeType' }
    const parent = {}

    expect(createSourceLayer({ layer: rawLayer, parent } as any)).toEqual(null)
  })

  it('returns sourceLayerShape when rawLayer.Type is Path', () => {
    const rawLayer = { Type: 'Path' }
    const parent = {}
    const instance = {}
    mocked(SourceLayerShape).mockReturnValueOnce(instance as any)

    expect(createSourceLayer({ layer: rawLayer, parent } as any)).toBe(instance)
  })

  it('returns sourceLayerText when rawLayer.Type is TextGroup', () => {
    const rawLayer = { Type: 'TextGroup' }
    const parent = {}
    const instance = {}
    mocked(SourceLayerText).mockReturnValueOnce(instance as any)

    expect(createSourceLayer({ layer: rawLayer, parent } as any)).toBe(instance)
  })

  it('returns sourceLayerGroup when rawLayer.Type is MarkedContext', () => {
    const rawLayer = { Type: 'MarkedContext' }
    const parent = {}
    const instance = {}
    mocked(SourceLayerGroup).mockReturnValueOnce(instance as any)

    expect(createSourceLayer({ layer: rawLayer, parent } as any)).toBe(instance)
  })

  it('returns sourceLayerShape when rawLayer.Type is Shading', () => {
    const rawLayer = { Type: 'MarkedContext' }
    const parent = {}
    const instance = {}
    mocked(SourceLayerGroup).mockReturnValueOnce(instance as any)

    expect(createSourceLayer({ layer: rawLayer, parent } as any)).toBe(instance)
  })

  it('returns null when rawLayer.Type is XObject and rawLayer.Name is undefined', () => {
    const rawLayer = { Type: 'XObject' }
    const parent = {}

    expect(createSourceLayer({ layer: rawLayer, parent } as any)).toBe(null)
  })

  it('returns SourceLayerXObjectImage when rawLayer.Type is XObject and resourcesXObject.Subtype is Image', () => {
    const rawLayer = { Type: 'XObject', Name: 'FM0' }

    const parent = {
      resources: {
        FM0: {
          Subtype: 'Image',
        },
        getXObjectByName: function (name: string) {
          return this[name]
        },
      },
    }

    const instance = {}

    mocked(SourceLayerXObjectImage).mockReturnValueOnce(instance as any)

    expect(createSourceLayer({ layer: rawLayer, parent } as any)).toBe(instance)
    expect(SourceLayerXObjectImage).toHaveBeenCalledWith({
      rawValue: parent.resources.FM0,
      parent,
      xObject: rawLayer,
    })
  })

  it('returns SourceLayerXObjectForm when rawLayer.Type is XObject and resourcesXObject.Subtype is Form', () => {
    const rawLayer = { Type: 'XObject', Name: 'FM0' }

    const parent = {
      resources: {
        FM0: {
          Subtype: 'Form',
        },
        getXObjectByName: function (name: string) {
          return this[name]
        },
      },
    }

    const instance = {}

    mocked(SourceLayerXObjectForm).mockReturnValueOnce(instance as any)

    expect(createSourceLayer({ layer: rawLayer, parent } as any)).toBe(instance)
    expect(SourceLayerXObjectForm).toHaveBeenCalledWith({
      rawValue: parent.resources.FM0,
      parent,
      xObject: rawLayer,
    })
  })

  it('returns null when rawLayer.Type is XObject and resourcesXObject.Subtype is not Form or Image', () => {
    const rawLayer = { Type: 'XObject', Name: 'FM0' }

    const parent = {
      resources: {
        FM0: {
          Subtype: 'unknownSubType',
        },
        getXObjectByName: function (name: string) {
          return this[name]
        },
      },
    }

    expect(createSourceLayer({ layer: rawLayer, parent } as any)).toBe(null)
  })
})
