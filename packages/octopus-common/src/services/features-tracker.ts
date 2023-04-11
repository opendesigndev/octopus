import { isObject, keys } from '../utils/common.js'
import { escapeRegExp } from '../utils/text.js'

import type { GenericComponentConversionResult } from '../typings/octopus-common/index.js'

type FeaturesTrackerOptions = {
  excludedPaths: RegExp[]
  onlyCountByKeys: RegExp[]
  sourceIncludedPaths?: RegExp[]
}

type BaseLayer = { type: 'SHAPE' | 'TEXT' | 'COMPONENT_REFERENCE' }
type GroupLayer = { type: 'GROUP' | 'MASK_GROUP'; layers: Layer[] }
type Layer = (BaseLayer | GroupLayer) & { mask?: Layer }

export class FeaturesTracker {
  private _excludedPaths: RegExp[]
  private _onlyCountByKeys: RegExp[] = []
  private _featuresSummary: Record<string, number> = {}
  private _sourceIncludedPaths: RegExp[]
  private _registeredObjects: WeakSet<object> = new WeakSet()

  static LAYER_KEY_PREFIX = 'layer'
  static MANIFEST_KEY_PREFIX = 'manifest'
  static CUSTOM_KEY_PREFIX = 'custom'
  static SOURCE_KEY_PREFIX = 'source'

  static DEFAULT_EXCLUDED_PATHS: RegExp[] = [
    new RegExp(/transform\.\[\]/),
    new RegExp('offset.'),
    new RegExp(/\bid\b/),
    new RegExp('geometry'),
    new RegExp('color.'),
    new RegExp('.png'),
    new RegExp(/\bmask\b/),
    new RegExp('image.ref.value'),
    new RegExp('name'),
    new RegExp('refId'),
    new RegExp('location.path'),
  ]

  static DEFAULT_ONLY_COUNT_BY_KEYS: RegExp[] = [new RegExp('text.value')]

  static withDefaultPathKeys(): FeaturesTracker {
    return new FeaturesTracker({
      excludedPaths: FeaturesTracker.DEFAULT_EXCLUDED_PATHS,
      onlyCountByKeys: FeaturesTracker.DEFAULT_ONLY_COUNT_BY_KEYS,
      sourceIncludedPaths: [],
    })
  }

  constructor({ excludedPaths, onlyCountByKeys, sourceIncludedPaths }: FeaturesTrackerOptions) {
    this._excludedPaths = excludedPaths
    this._onlyCountByKeys = onlyCountByKeys
    this._sourceIncludedPaths = sourceIncludedPaths ?? []
  }

  private extractSubpathsFromObject(obj: object): string[][] {
    const newPaths = keys(obj as Record<string, unknown>).map((key) => [key])

    const extracted = this._extractPathsFromObject(obj, newPaths)

    return extracted
  }

  private _addKey(key: string) {
    if (!this._featuresSummary[key]) {
      this._featuresSummary[key] = 1
      return
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

      const returnVal = isObject(subObject) ? subObject : null

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

      if (this._registeredObjects.has(currentObj)) {
        return paths
      }

      this._registeredObjects.add(currentObj)

      const relativePaths = this.extractSubpathsFromObject(currentObj)
      return [...paths, ...relativePaths.map((relativePath) => [...path, ...relativePath])]
    }, [])

    return [...basePaths, ...subPaths]
  }

  private _getMergedPath(path: string[]): string {
    return path.reduce((mergedPath, pathStr) => {
      if (!Number.isFinite(Number(pathStr))) {
        return mergedPath ? mergedPath + '.' + pathStr : pathStr
      }
      return mergedPath + '.[]'
    }, '')
  }

  private _getKey({
    object,
    path,
    excludedPaths,
  }: {
    object: object
    path: string[]
    excludedPaths: RegExp[]
  }): string | null {
    const mergedPath = this._getMergedPath(path)
    const isPathExcluded = excludedPaths.some((pathKey) => pathKey.test(mergedPath))

    if (isPathExcluded) {
      return null
    }

    const value = this._getCurrentValue(object, path)
    const isByValue =
      typeof value === 'string' && !this._onlyCountByKeys.some((countByKeyPath) => countByKeyPath.test(mergedPath))

    if (typeof value === 'undefined' || (Array.isArray(value) && !value.length)) {
      return null
    }

    if (!isByValue) {
      return mergedPath
    }

    return `${mergedPath}.${value}`
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

  private _collectLayerFeatures(layer: Layer) {
    const { type: layerType } = layer

    if (layerType === 'GROUP' || layerType === 'MASK_GROUP') {
      layer.layers.forEach((layer) => this._collectLayerFeatures(layer))
    }

    this._addKey(`${FeaturesTracker.LAYER_KEY_PREFIX}.layers`)

    if ('mask' in layer && layer.mask) {
      this._addKey(`${FeaturesTracker.LAYER_KEY_PREFIX}.masks`)
      this._collectLayerFeatures(layer.mask)
    }

    const paths = this._extractPathsFromObject(layer)

    paths.forEach((path) => {
      const key = this._getKey({ object: layer, path, excludedPaths: this._excludedPaths })

      if (!key) {
        return
      }

      this._addKey(`${FeaturesTracker.LAYER_KEY_PREFIX}.${key}`)
    })
  }

  collectSourceFeatures(source: object) {
    const sourcePaths = this._extractPathsFromObject(source)
    const excludedPaths = sourcePaths
      .map((path) => this._getMergedPath(path))
      .filter((path) => !this._sourceIncludedPaths.some((includedPath) => includedPath.test(path)))
      .map((path) => new RegExp('^' + escapeRegExp(path) + '$'))

    sourcePaths.forEach((path) => {
      const key = this._getKey({ object: source, path, excludedPaths })
      if (!key) {
        return
      }

      const keyPrefixGlue = key.startsWith('.') ? '' : '.'
      this._addKey(`${FeaturesTracker.SOURCE_KEY_PREFIX}${keyPrefixGlue}${key}`)
    })
  }

  collectLayerFeatures<T extends { content?: Layer }>(components: GenericComponentConversionResult<T>[]) {
    components.forEach((component) => {
      if (component.value?.content) {
        this._collectLayerFeatures(component.value.content)
      }
    })
  }

  collectManifestFeatures(manifest: object) {
    const paths = this._extractPathsFromObject(manifest)

    paths.forEach((path) => {
      const key = this._getKey({ object: manifest, path, excludedPaths: this._excludedPaths })

      if (!key) {
        return
      }

      this._addKey(`${FeaturesTracker.MANIFEST_KEY_PREFIX}.${key}`)
    })
  }

  registerSpecificFeatures(key: string) {
    this._addKey(`${FeaturesTracker.CUSTOM_KEY_PREFIX}.${key}`)
  }

  get statistics(): Record<string, number> {
    return keys(this._featuresSummary)
      .sort()
      .reduce<Record<string, number>>((acc, key) => {
        acc[key] = this._featuresSummary[key]

        return acc
      }, {})
  }
}
