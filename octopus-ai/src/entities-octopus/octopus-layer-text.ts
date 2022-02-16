import OctopusLayerCommon, {LayerSpecifics} from "./octopus-layer-common";
import type SourceLayerText from '../entities-source/source-layer-text'
import {OctopusLayerParent} from '../typings/octopus-entities'
import type { Octopus } from '../typings/octopus'
import { RawTextLayerText } from "../typings/source";
import type SourceLayerNormalizedText from '../entities-source/source-layer-text-normalized'
import { text } from "node:stream/consumers";

type OctopusLayerTextOptions = {
    parent: OctopusLayerParent,
    sourceLayer: SourceLayerText
  }

export default class OctopusLayerText extends OctopusLayerCommon {
    protected _sourceLayer: SourceLayerText

    constructor(options: OctopusLayerTextOptions) {
        super(options)
      }

      private _parseFontSize(text:RawTextLayerText){
          return text
      }
      private _parseFont(text:SourceLayerNormalizedText){

      }

      private _parseText(text:SourceLayerNormalizedText){
        const artboardResources = this.parent.resources
        const font = this._parseFont(text)
      }

      private _getTexts(){
       const texts= this._sourceLayer.texts.map(text=>this._parseText(text))

    }
  
    private _convertTypeSpecific(): LayerSpecifics<Octopus['TextLayer']> | null {
       const textValue = this._sourceLayer.textValue
       const name = this._sourceLayer.name

        if (!text) return null
        return {
          type: 'TEXT',
          // @ts-ignore
          text:{
            value: textValue
          },
          name
        }
      }
      
      //@ts-ignore
      convert(): Octopus['TextLayer'] | null {
        const common = this.convertCommon()
        if (!common) return null
    
        const specific = this._convertTypeSpecific()
        if (!specific) return null
    
        return {
          ...common,
          ...specific,
        }
      }
}