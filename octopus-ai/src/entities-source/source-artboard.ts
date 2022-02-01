import _ from 'lodash'

import { RawArtboardEntry } from "../typings/source/artboard";
import SourceBounds from './source-bounds';
import { asArray } from '../utils/as';
import { createSourceLayer, SourceLayer } from '../factories/create-source-layer';
import { RawLayer } from '../typings/source/source-layer-common';

export default class SourceArtboard {
    private _rawArtboard:RawArtboardEntry
    private _bounds: SourceBounds
    private _children: SourceLayer[]

    static getBounds(sourceArtboard: RawArtboardEntry){
        const [top, left, width, height] = _.get(sourceArtboard, 'MediaBox', [0, 0, 0, 0])
        return SourceBounds.from(top,left,width,height)
    }

    constructor(rawArtboard: RawArtboardEntry){
        this._rawArtboard = rawArtboard
        this._bounds = SourceArtboard.getBounds(rawArtboard)
        this._children = this._initChildren()
    }

    private _initChildren() {
        const children = asArray(this._rawArtboard?.Contents?.Data)
        return children.reduce((children: SourceLayer[], layer: RawLayer, i:number) => {
          const sourceLayer = createSourceLayer({
            layer,
            parent: this,
            path: [i]
          })
          return sourceLayer ? [ ...children, sourceLayer ] : children
        }, [])
      }

    public get layers () {
        return this._children
    }

    public get id (){
        return _.get(this._rawArtboard,'Id')
    }

    public get name (){
        return _.get(this._rawArtboard,'Name')
    }

    public get bounds (){
        return this._bounds
    }

    get children () {
        return this._children
    }
}