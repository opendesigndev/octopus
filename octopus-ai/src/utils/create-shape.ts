//https://gitlab.avcd.cz/avocode/node-sketch-writer/-/blob/master/src/utils/create-shape.ts
/**
 * This file is taken from svg-exporter and slightly modified, the purpose of createShape() is 
 * to generate paper.CompoundPath | paper.Path based on Octopus shape.
 */

//@ts-nocheck
 import get from 'lodash/get'
 import isArray from 'lodash/isArray'
 
 import {
   createPath,
   createPoint,
   createSegment,
 } from './paper-factories'
  
 export type OctopusArtboard = {
    id?: string,
    name?: string
  }
  
  export type SketchDocumentOptions = {
    defaultPageId?: string
  }
  
  export type SketchColor = {
    red: number,
    green: number,
    blue: number,
    alpha: number
  }
  
  export type OctopusColor = {
    r: number,
    g: number,
    b: number,
    a: number
  }
  
  export type OctopusTextMatrix = {a: number, b: number, c: number, d: number, tx: number, ty: number}
  
  export type OctopusLayerRaw = {
    id: string,
    name: string,
    effects?: Object,
    shape?: Object,
    type: OctopusLayerType,
    layers?: OctopusLayerRaw[],
    clipped?: boolean,
    maskType?: string,
    bounds?: OctopusBounds,
    visible?: boolean,
    opacity?: number,
    blendMode?: string,
    origin?: string,
    rotation?: number,
    isFlippedVertical?: boolean,
    isFlippedHorizontal?: boolean
  }
  
  export type OctopusShape = {
    paths: OctopusPath[],
    windingRule: string,
    bounds?: OctopusBounds
  }
  
  export type OctopusPoint = {
    type: string,
    coordinates: number[],
    radius: number
  }
  
  export type OctopusPath = {subpaths:OctopusSubpath[]}
  export type OctopusGradientStop = Object
  export type OctopusBlendMode = string
  
  export type OctopusBooleanOps = 'union' | 'subtraction' | 'intersection' | 'intersection'
  export type OctopusSubpath = {points: OctopusPoint[], closed: boolean}
  export type OctopusShadow = Object
  export type OctopusGradient = Object
  export type OctopusBlur = Object
  export type OctopusDashPattern = []
  export type OctopusLineCapStyle = string
  export type OctopusLineJoinStyle = string
  export type OctopusBorder = Object
  export type OctopusRangeStyle = Object
  export type OctopusText = Object
  export type OctopusFill = Object
  
  export type OctopusBounds = {
    top: number,
    left: number,
    right: number,
    bottom: number,
    width: number,
    height: number
  }
  
  export type OctopusPageRaw = {}
  export type OctopusArtboardRaw = {}
  
  export type OctopusLayerType = 'shapeLayer' | 'groupLayer' | 'textLayer'
  
  
  export interface IArtboard {
    getObjectId(): string
    getName(): string
  }
  
  export interface ISketchDocument {
  
  }
  
  export interface ILayer {
  
  }
  
  export type ArtboardFrameDefaultsType = {
    _class: 'rect',
    'constrainProportions': boolean
  }
  
 
 function segInOrPoint(seg: paper.Segment) {
   return (seg.handleIn.x || seg.handleIn.y)
     ? seg.point.add(seg.handleIn)
     : seg.point
 }
 
 function segOutOrPoint(seg: paper.Segment) {
   return (seg.handleOut.x || seg.handleOut.y)
     ? seg.point.add(seg.handleOut)
     : seg.point
 }
 
 const hasHandles = (seg: paper.Segment): boolean => {
   return Boolean(seg.handleIn.x || seg.handleIn.y || seg.handleOut.x || seg.handleOut.y)
 }
 
 const applyRadiuses = (path: paper.Path, radiuses: number[]) => {
   const segments = path.segments.slice(0)
   path.segments = []
   const len = segments.length
   return segments.reduce((path, segment, i) => {
     if (hasHandles(segment)) {
       path.add(segment)
       return path
     }
     const curPoint = segment.point
     const next = segments[i + 1 === len ? 0 : i + 1]
     const prev = segments[i - 1 < 0 ? len - 1 : i - 1]
     const nextPoint = segInOrPoint(next)
     const prevPoint = segOutOrPoint(prev)
     const radius = Math.min(
       radiuses[i],
       Math.floor(
         Math.min(
           nextPoint.getDistance(curPoint),
           prevPoint.getDistance(curPoint)
         ) / 2
       )
     )
     const nextNorm = curPoint.subtract(nextPoint).normalize()
     const prevNorm = curPoint.subtract(prevPoint).normalize()
     const angle = Math.acos(nextNorm.dot(prevNorm))
     const delta = Math.tan(angle / 2) ? (radius / Math.tan(angle / 2)) : 0
     const prevDelta = prevNorm.normalize(delta)
     const nextDelta = nextNorm.normalize(delta)
     const through = curPoint.subtract((prevNorm.add(nextNorm)).normalize(
       Math.sqrt(delta * delta + radius * radius) - radius
     ))
     path.add(curPoint.subtract(prevDelta))
     path.arcTo(through, curPoint.subtract(nextDelta))
     return path
   }, path)
 }
 
 const isSubpathValid = (subPath: OctopusSubpath): boolean => {
   const points = subPath.points

   return !(isArray(points) ? [] : points).length <= 1
 }
 
 const createPointSegment = (coords: number[]): paper.Point => {
   const [x, y] = coords
   return createPoint(x, y)
 }
 
 const createBezierSegment = (coords: number[]): paper.Segment => {
   const [x1, y1, x2, y2, x3, y3] = coords
   const anchor = createPoint(x3, y3)
   return createSegment(
     anchor,
     createPoint(x1, y1).subtract(anchor),
     createPoint(x2, y2).subtract(anchor)
   )
 }
 
 const pointToSegment = (point: OctopusPoint): paper.Segment => {
   const segmentProcessors = {
     point: createPointSegment,
     bezier: createBezierSegment
   }
   const pointType = get(point, 'type')
   const coords = get(point, 'coordinates')
   return segmentProcessors[pointType](coords)
 }
 
 const extractRadiuses = (points) => {
   return points.map(point => get(point, 'radius'))
 }
 
 const createSubpath = (subpath: OctopusSubpath): paper.Path => {
   const segments = subpath.points.map(pointToSegment)
   const shape = createPath(segments)
   if (shape.segments.length <= 2) return shape
   const radiuses = extractRadiuses(subpath.points).map((radius) => {
     return typeof radius !== 'number' ? 0 : radius
   })
   const roundedShape = applyRadiuses(shape, radiuses)
   roundedShape.closed = subpath.closed
   return roundedShape
 }
 
 const processSubpaths = (subpaths: Array<OctopusSubpath>): paper.Path => {
   const subpathEntities = subpaths.filter((subpath) => {
     return get(subpath, 'points.length') > 1
   }).map((subpath: OctopusSubpath) => {
     return createSubpath(subpath)
   })
   if (!subpathEntities.length) return null
   return subpathEntities.reduce((prev: paper.Path, current: paper.Path): paper.Path => {
     [prev, current].forEach((shape) => (shape.closed = true))
     return prev.exclude(current) as paper.Path
   })
 }

 export default function createShape(subpaths:OctopusSubpath[]): paper.Path {
  
  const validSubpaths = subpaths.filter(isSubpathValid)
  const shape = processSubpaths(validSubpaths)

 
   if (!shape) {
     return null
   }


    return shape
 }
 