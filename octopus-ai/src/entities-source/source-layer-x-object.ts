import { RawXObjectLayer } from '../typings/source/x-object'
import SourceLayerCommon, {SourceLayerParent} from '../entities-source/source-layer-common'

type SourceLayerXObjectOptions = {
    parent: SourceLayerParent,
    rawValue: RawXObjectLayer,
    path: number[]
  }

  export default class SourceLayerShape extends SourceLayerCommon {
    protected _rawValue: RawXObjectLayer

    constructor(options: SourceLayerXObjectOptions){
        super(options)
        this._rawValue = options.rawValue
    }  

    get name () {
        return this._rawValue.Name
    }

    get graphicsState () {
      return this._rawValue.GraphicsState
    }

    get lineJoin(){
      return this.graphicsState.LineJoin || 0
    }

    get lineCap() {
      return this.graphicsState.LineCap || 0
    }

    // get XObject () {
    //     this._parent.resources.
    // }

    //  const xobject = _.get(artboardData.resources, `XObject.${name}`)
  //     const subtype = _.get(xobject, 'Subtype')
}
