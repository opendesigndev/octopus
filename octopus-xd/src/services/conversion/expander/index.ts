import { asArray, asString } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'
import cloneDeep from 'lodash/cloneDeep'
import mergeWith from 'lodash/mergeWith'
import pick from 'lodash/pick'
import without from 'lodash/without'

import { flattenLayers, childrenOf } from '../../../utils/expander-utils'

import type SourceResources from '../../../entities/source/source-resources'
import type { RawArtboard, RawArtboardEntry, RawLayer } from '../../../typings/source'

type ExpanderOptions = {
  resources: SourceResources
}

export default class Expander {
  private _resources: SourceResources
  private _symbols: RawLayer[]

  /**
   * Properties related to symbol internal connections
   * + properties that shouldn't be copied in general (`type`).
   */
  static SKIP_PROPS = ['type', 'syncSourceGuid', 'guid']

  static GROUP_LIKE = ['children', 'group', 'shape']

  constructor(options: ExpanderOptions) {
    this._resources = options.resources
    this._symbols = this._initSymbols()
  }

  private _initSymbols() {
    return asArray(this._resources.raw.resources?.meta?.ux?.symbols).reduce((ids, symbol) => {
      return push(ids, ...flattenLayers(symbol, true, true))
    }, [])
  }

  private _getTargetObjectProps(child: RawLayer) {
    return pick(child, without(Object.keys(child), ...Expander.SKIP_PROPS))
  }

  private _merge(objValue: unknown, srcValue: unknown, key: string) {
    if (Expander.GROUP_LIKE.includes(key)) {
      return undefined
    }
    return srcValue === undefined ? objValue : srcValue
  }

  private _replaceValues(replaceWith: RawLayer, restProps: unknown, id: string) {
    return mergeWith({}, cloneDeep(replaceWith), restProps, { id }, (objValue, srcValue, key) => {
      return this._merge(objValue, srcValue, key)
    })
  }

  private _expandChild(child: RawLayer, index: number, children: RawLayer[]) {
    const ref = child?.syncSourceGuid
    const id = child?.guid
    const restProps = this._getTargetObjectProps(child)
    if (ref) {
      const replaceWith = this._symbols.find((layer) => layer?.id === ref)
      const clone = replaceWith ? this._replaceValues(replaceWith, restProps, asString(id)) : null
      children.splice(index, 1, clone as RawLayer)
      this._expand(clone as RawLayer)
    } else {
      this._expand(child as RawLayer)
    }
  }

  private _expand(artboard: RawArtboardEntry | RawLayer) {
    childrenOf(artboard).forEach((child, index, children) => {
      this._expandChild(child, index, children)
    })
  }

  expand(artboard: RawArtboard): RawArtboard {
    return {
      ...artboard,
      children: artboard.children?.map((artboard) => {
        const clone = cloneDeep(artboard)
        if (!clone) return clone
        this._expand(clone as RawArtboardEntry)
        return clone
      }),
    }
  }
}
