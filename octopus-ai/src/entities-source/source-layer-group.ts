import SourceLayerCommon from './source-layer-common'
import {RawGroupLayer, RawLayer} from '../typings/source'
import {SourceLayerParent} from './source-layer-common'
import { asArray } from '../utils/as';
import { createSourceLayer, SourceLayer } from '../factories/create-source-layer';

type SourceLayerGroupOptions = {
    parent: SourceLayerParent,
    rawValue: RawGroupLayer,
    path: number[]
  }

export default class SourceLayerGroup extends SourceLayerCommon {
    private _rawValue: RawGroupLayer
    private _children: SourceLayer []

    constructor(options: SourceLayerGroupOptions){
        super(options.path)
        this._rawValue = options.rawValue
        this._children = this._initChildren()
    }

    private _initChildren() {
        const children = asArray(this._rawValue?.Kids)
        return children.reduce((children: SourceLayer[], layer: RawLayer, i:number) => {
          const sourceLayer = createSourceLayer({
            layer,
            parent: this,
            path: this.path.concat(i)
          })
          return sourceLayer ? [ ...children, sourceLayer ] : children
        }, [])
      }

     get children () {
         return this._children
     }

     get raw () {
         return this._rawValue
     }
}