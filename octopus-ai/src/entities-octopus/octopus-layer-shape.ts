import OctopusLayerCommon, {LayerSpecifics} from "./octopus-layer-common";
import type SourceLayerText from '../entities-source/source-layer-text'
import {OctopusLayerParent} from '../typings/octopus-entities'
import type { Octopus } from '../typings/octopus'
import { RawShapeLayer } from "../typings/source";
import SourceLayerShape from "../entities-source/source-layer-shape";

type OctopusLayerShapeOptions = {
    parent: OctopusLayerParent,
    sourceLayer: SourceLayerShape
  }


export default class OctopusLayerShape extends OctopusLayerCommon {
    protected _sourceLayer: SourceLayerShape

    constructor(options: OctopusLayerShapeOptions){
        super(options)
        this._sourceLayer=options.sourceLayer
    }

    get shapes(){
       return this._sourceLayer.subPaths
    }
    private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> | null {
        return {
          type: 'SHAPE',
          //@ts-ignore
          shapes: this.shapes 
        }
      }

      convert(): Octopus['GroupLayer'] | null {
        const common = this.convertCommon()
        if (!common) return null
        //@ts-ignore
        return {
          ...common,
          ...this._convertTypeSpecific()
        }
      }

}
