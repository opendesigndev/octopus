import { LayerSpecifics, OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { Octopus } from '../../typings/octopus'
import { asNumber } from '../../utils/as'
// import { RawShapeCompound, RawShapeRect } from '../typings/source'
// import { asArray, asNumber } from '../utils/as'
// import { convertBooleanOp } from '../utils/boolean-ops'
// import { createOctopusLayer } from '../factories/create-octopus-layer'
// import { buildShapePathSafe } from '../utils/path-builders'
// import { Defined } from '../typings/helpers'

type OctopusLayerShapeShapeAdapterOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

export class OctopusLayerShapeShapeAdapter extends OctopusLayerCommon {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerShape
  //   _children: OctopusLayerShape[]
  //   _shapeData: string

  constructor(options: OctopusLayerShapeShapeAdapterOptions) {
    super(options)
    // this._children = this._initChildren()
  }

  //   _normalizeShapeData() {
  //     return buildShapePathSafe(this._sourceLayer.shape)
  //   }

  //   _initChildren() {
  //     return asArray(this._sourceLayer.children).reduce((layers, shapeLayer) => {
  //       const octopusLayer = createOctopusLayer({
  //         parent: this,
  //         layer: shapeLayer,
  //       }) as OctopusLayerShape
  //       return octopusLayer ? [...layers, octopusLayer] : layers
  //     }, [])
  //   }

  get shapeType(): Octopus['PathType'] {
    if (this._sourceLayer.pathComponents.length > 1) {
      return 'COMPOUND'
    } else if (this._sourceLayer.firstPathComponent?.origin?.type === 'rect') {
      return 'RECTANGLE' // TODO for rotated/transformed rectangles
    } else {
      return 'PATH'
    }
  }

  // private _getShapeAsCompound(): Octopus['CompoundPath'] {
  //   const compound = this._sourceLayer.shape as RawShapeCompound
  //   const geometry =
  //     typeof compound.path === 'string'
  //       ? {
  //           geometry: compound.path,
  //         }
  //       : null
  //   return {
  //     type: 'COMPOUND',
  //     op: convertBooleanOp(compound),
  //     paths: this._children.map((shapeLayer) => shapeLayer._getShape()),
  //     ...geometry,
  //   }
  // }

  private _getShapeAsRect(): Octopus['PathRectangle'] {
    const rect = this._sourceLayer.firstPathComponent
    const { bottom, left, right, top } = rect?.origin?.bounds ?? {}

    return {
      type: 'RECTANGLE',
      rectangle: {
        x0: asNumber(left),
        y0: asNumber(top),
        x1: asNumber(right),
        y1: asNumber(bottom),
      },
      cornerRadii: [], // rect?.r, // TODO
    }
  }

  // private _getShapeAsPath(): Octopus['Path'] {
  //   return {
  //     type: 'PATH',
  //     geometry: this._shapeData,
  //   }
  // }

  private get _path(): Octopus['PathLike'] {
    return this._getShapeAsRect() // TODO
    // switch (this.shapeType) {
    //   case 'COMPOUND': {
    //     return this._getShapeAsCompound()
    //   }
    //   case 'RECTANGLE': {
    //     return this._getShapeAsRect()
    //   }
    // }
    // return this._getShapeAsPath()
  }

  private get _shapes(): Octopus['Shape'][] {
    const fillShape: Octopus['Shape'] = {
      purpose: 'BODY',
      fillRule: 'EVEN_ODD',
      path: this._path,
      // ...this.shapeEffects.convert() // TODO
    }
    return [fillShape]
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> {
    return {
      type: 'SHAPE',
      shapes: this._shapes,
    } as const
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    return {
      ...common,
      ...this._convertTypeSpecific(),
    }
  }
}
