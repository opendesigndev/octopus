/**
 * Those fns are mainly used by ported version of utils/createShape.
 */
 //@ts-nocheck

 import has from 'lodash/has'
 import at from 'lodash/at'
 import get from 'lodash/get'
 import paper from 'paper'
 
 //@todo  move this type somwhere
 type OctopusBounds = {
  top: number,
  left: number,
  right: number,
  bottom: number,
  width: number,
  height: number
}

 paper.setup(new paper.Size(640, 480))
 
 export function createSize(width: number, height?: number): paper.Size {
   return new paper.Size(width, height === undefined ? width : height)
 }
 export function createPoint(x: number, y: number): paper.Point {
   return new paper.Point(x, y)
 }
 export function createRectangleFromPointSize(point: paper.Point, size: paper.Size): paper.Rectangle {
   return new paper.Rectangle(point, size)
 }
 export function createRectangleFromBounds(bounds: OctopusBounds): paper.Rectangle {
   return createRectangleFromPointSize(
     createPoint(bounds.left, bounds.top),
     createSize(bounds.width, bounds.height)
   )
 }

 export function createRectangle(arg0: paper.Point | OctopusBounds, arg1?: paper.Size): paper.Rectangle {
   const hasPointSize = arg0 instanceof paper.Point && arg1 instanceof paper.Size
   if (hasPointSize) {
     return createRectangleFromPointSize(arg0 as paper.Point, arg1)
   }
   const isBoundsObject = ['top', 'left', 'width', 'height'].every((prop) => {
     return has(arg0, prop)
   })
   if (isBoundsObject) {
     return createRectangleFromBounds(arg0 as OctopusBounds)
   }
    
   // @ts-ignore
   return null
 }

 export function createSegment(point: paper.Point, handleIn: paper.Point, handleOut: paper.Point): paper.Segment {
   return new paper.Segment(point, handleIn, handleOut)
 }
 export function createSegmentI(point: paper.Point, handleIn: paper.Point) {
   return createSegment(point, handleIn, null)
 }
 export function createSegmentO(point: paper.Point, handleOut: paper.Point) {
   return createSegment(point, null, handleOut)
 }
 export function createPath(options: Object | Array<paper.Segment>): paper.Path {
   return new paper.Path(options)
 }
 export function createPathRectangle(...rect: Array<paper.Point | OctopusBounds | paper.Size>): paper.Path {
   // @ts-ignore
   return new paper.Path.Rectangle(createRectangle(...rect))
 }
 export function createPathEllipse(...rect: Array<paper.Point | OctopusBounds | paper.Size>): paper.Path {
   // @ts-ignore
   return new paper.Path.Ellipse(createRectangle(...rect))
 }
 export function createCompoundPath(pathData: string | Object): paper.CompoundPath {
   return new paper.CompoundPath(typeof pathData === 'string' ? {pathData} : pathData)
 }
 export function paperBounds(any: paper.Path): OctopusBounds {
   const props = ['x', 'y', 'width', 'height']
   const [x, y, width, height] = at(get(any, 'bounds'), props)
   return { top: y, left: x, right: x + width, bottom: y + height, width, height }
 }
 export function createGroup(...paths: Array<paper.Path>): paper.Group {
   return new paper.Group(paths)
 }
 