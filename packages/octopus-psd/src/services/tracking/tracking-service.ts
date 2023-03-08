import { keys } from '@opendesign/octopus-common/dist/utils/common.js'

import type { ComponentConversionResult } from '../conversion/design-converter.js'
import type { components } from '@opendesign/octopus-ts/dist/octopus.js'

type PathKey = {
  path: string
  byValue: boolean
}

export class TrackingService {
  private _pathKeys: PathKey[]
  private _featuresSummary: Record<string, number> = {}

  static DEFAULT_PATH_KEYS: PathKey[] = [
    { path: 'opacity', byValue: false },
    { path: 'visible', byValue: true },
    { path: 'shape.fills.type', byValue: true },
    { path: 'shape.path.type', byValue: true },
    { path: 'blendMode', byValue: true },
    { path: 'text.defaultStyle.fills.type', byValue: true },
  ]

  static withDefaultPathKeys(): TrackingService {
    return new TrackingService(TrackingService.DEFAULT_PATH_KEYS)
  }

  constructor(pathKeys: PathKey[]) {
    this._pathKeys = pathKeys
  }

  private extractSubpathsFromObject(obj: object): string[][] {
    const newPaths = keys(obj as Record<string, unknown>).map((key) => [key])

    const extracted = this._extractPathsFromObject(obj, newPaths)

    return extracted
  }

  private _addKey(key: string) {
    if (!this._featuresSummary[key]) {
      this._featuresSummary[key] = 1
    }

    this._featuresSummary[key] += 1
  }

  private _getLastObjectFromPath(obj: object, path: string[]): object | null {
    return path.reduce<object | null>((currentObj, key) => {
      if (!currentObj) {
        return null
      }

      if (!(key in currentObj)) {
        throw new Error('Invalid layer path')
      }

      const subObject = currentObj[key as keyof typeof currentObj]

      const returnVal = typeof subObject === 'object' ? subObject : null

      return returnVal
    }, obj)
  }

  private _extractPathsFromObject(obj: object, paths: string[][] = []): string[][] {
    const basePaths = paths.length
      ? paths
      : keys(obj as Record<string, unknown>)
          .filter((key) => key !== 'layers')
          .map((key) => [key])

    const subPaths = basePaths.reduce<string[][]>((paths, path) => {
      const currentObj = this._getLastObjectFromPath(obj, [...path])

      if (!currentObj) {
        return paths
      }

      const relativePaths = this.extractSubpathsFromObject(currentObj)
      return [...paths, ...relativePaths.map((relativePath) => [...path, ...relativePath])]
    }, [])

    return [...basePaths, ...subPaths]
  }

  private _getPathKey(path: string[]): PathKey | null {
    const mergedPath = path.filter((pathStr) => isNaN(Number(pathStr))).join('.')

    return this._pathKeys.find((pathKey) => pathKey.path === mergedPath) ?? null
  }

  private _getCurrentValue(obj: object, path: string[]): object | string {
    return path.reduce<object | string>((currentObj, key) => {
      if (typeof currentObj !== 'object') {
        return currentObj
      }

      if (!(key in currentObj)) {
        throw new Error('Invalid layer path')
      }

      return currentObj[key as keyof typeof currentObj] as object | string
    }, obj)
  }

  private _getKey(path: string[], pathKey: PathKey, layer: components['schemas']['Layer']): string | null {
    const value = this._getCurrentValue(layer, path)

    if (typeof value === 'undefined' || (Array.isArray(value) && !value.length)) {
      return null
    }

    if (!pathKey.byValue) {
      return pathKey.path
    }

    return `${pathKey.path}.${this._getCurrentValue(layer, path)}`
  }

  private _collectLayerFeatures(layer: components['schemas']['Layer']) {
    const { type: layerType } = layer

    if (layerType === 'GROUP' || layerType === 'MASK_GROUP') {
      layer.layers.forEach((layer) => this._collectLayerFeatures(layer))
    }

    this._addKey('layers')

    if ('mask' in layer) {
      this._addKey('masks')
      this._collectLayerFeatures(layer.mask)
    }

    const paths = this._extractPathsFromObject(layer)

    paths.forEach((path) => {
      const pathKey = this._getPathKey(path)
      if (!pathKey) {
        return
      }

      const key = this._getKey(path, pathKey, layer)
      if (key) this._addKey(key)
    })
  }

  collectFeatures(components: ComponentConversionResult[]): Record<string, number> {
    components.forEach((component) => {
      if (component.value?.content) {
        this._collectLayerFeatures(component.value.content)
      }
    })

    return Object.keys(this._featuresSummary)
      .sort()
      .reduce<Record<string, number>>((acc, key) => {
        acc[key] = this._featuresSummary[key]

        return acc
      }, {})
  }
}
