import OctopusLayerCommon, {LayerSpecifics} from "./octopus-layer-common";
import {OctopusLayerParent} from '../typings/octopus-entities'
import type { Octopus } from '../typings/octopus'
import SourceLayerShape from "../entities-source/source-layer-shape";
import SourceLayerShapeSubPath from "../entities-source/source-layer-shape-subpath";
import {calculateBottomRightCorner, calculateTopLeftCorner, createRectPoints, isValid, transformCoords} from '../utils/coords'
import OctopusEffectsShape from './octopus-effects-shape'
import { createPoint,createSegment } from "../utils/paper-factories";
import { createPath } from '../utils/paper-factories';
import {Segment} from 'paper'

type OctopusLayerShapeOptions = {
    parent: OctopusLayerParent,
    sourceLayer: SourceLayerShape
  }

  type PointXY = {
    x:number,
    y:number
  }

export default class OctopusLayerShape extends OctopusLayerCommon {
    static  FILL_RULE  ={
      'non-zero-winding-number': 'NON_ZERO',
      'even-odd': 'EVEN_ODD'
    }

    protected _sourceLayer: SourceLayerShape

    constructor(options: OctopusLayerShapeOptions){
        super(options)
        this._sourceLayer=options.sourceLayer
    }

    private _isRect(subPath: SourceLayerShapeSubPath){
     return subPath.type=='Rect'
    }
      
    private _parseRectangleCoords(parentHeight:number,coords:number[]){
      const matrix = this._sourceLayer.transformMatrix
      const rectPoints = createRectPoints({parentHeight,matrix},coords)
      const [x0,y0] = calculateTopLeftCorner(rectPoints)
      const [x1,y1] = calculateBottomRightCorner(rectPoints)
      return {x0,y0,x1,y1}
    }

    private _parseRect(shape:SourceLayerShapeSubPath) {
      const coords = shape.coords || [0,0,0,0]
      const parentHeight =this._parent.dimensions.height|| 0
      const rectangle = this._parseRectangleCoords(parentHeight,coords)

      return {
        purpose: 'BODY',
        fillRule: this.fillRule,
        path:{
          rectangle,
          type: "RECTANGLE",
          //@todo: should this be here? should we use transformCoords?
          transform: this._sourceLayer.transformMatrix,
          //@todo check what is this, no idea from illustrator2
          cornerRadii: [
            0,
            0,
            0,
            0
          ]
        },
        ...this.shapeEffects
      }
    }

    get shapeEffects() {
      const sourceLayer = this._sourceLayer
      const resources =  this._parent.resources

      if (!resources) {
        throw new Error('Design resources are missing, can\'t resolve effects.')
      }
  
      return new OctopusEffectsShape({
        sourceLayer,
        resources
      }).convert()
    }

    private _createGeometry(shape: SourceLayerShapeSubPath){
      const validRawPoints = shape.points?.filter(isValid) || []
      if (validRawPoints.length === 0) {
        return []
      }
     
      const parsedPoints: any[] = []
      const matrix = this._sourceLayer.transformMatrix
      const parentHeight =this._parent.dimensions.height|| 0

      validRawPoints.forEach((rawPoint)=>{
        if(rawPoint.Type === 'Curve'){

          const coords =transformCoords({matrix, parentHeight}, rawPoint.Coords)
          const [x1, y1, x2, y2, x3, y3] = rawPoint.Coords

          console.error('coors',x1, y1, x2, y2, x3, y3 )
          const anchor = createPoint(x3,y3)
          const handleIn = createPoint(x2-x3,y2-y3)
          const handleOut = createPoint(x1-x3,y1-y3)
          parsedPoints.push(createSegment(anchor,handleIn,handleOut))
        }

        if(rawPoint.Type==='Line') {
          console.error('___line')
          const [x,y] = rawPoint.Coords
          parsedPoints.push(createPoint(x,y))
        }
      })

      return createPath(parsedPoints).pathData
    }

    private _parsePath(shape: SourceLayerShapeSubPath) {
      const geometry = this._createGeometry(shape)

        return {
          purpose:'BODY',
          path: {
            geometry,
            type: 'PATH',
            transform: this._sourceLayer.transformMatrix,
          },
          fillRule: this.fillRule,
          ...this.shapeEffects,
          //@todo check what is this, no idea from illustrator2
          cornerRadii: [
            0,
            0,
            0,
            0
          ]
        }
    }


    private _parseShapes(){
       return this._sourceLayer.subPaths.map((shape)=>{
        if(this._isRect(shape)){
          return this._parseRect(shape)
        }

        return this._parsePath(shape)
       })
    }

    get fillRule () {
      const sourceFillRule =  this._sourceLayer.fillRule
      
      return sourceFillRule 
      ? OctopusLayerShape.FILL_RULE[sourceFillRule] 
      : OctopusLayerShape.FILL_RULE["even-odd"]
    }



    private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> | null {
        return {
          purpose: 'BODY',
          type: 'SHAPE',
          fillRule: this.fillRule,
          //@ts-ignore
          shapes: this._parseShapes()
        }
      }

      convert(): Octopus['ShapeLayer'] | null {
        const common = this.convertCommon()
        
        if (!common) return null
        //@ts-ignore
        return {
          ...common,
          ...this._convertTypeSpecific()
        }
      }

}
