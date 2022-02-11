import { RawShapeLayerSubPathPoint } from "../typings/source"

type TransformOptions = {
    parentHeight: number,
    matrix: [number,number,number,number,number,number]
}
type Coord=[number,number]

export function transformCoords(
    transformOptions: TransformOptions,
    coords:number[]
  ): number[] {
    const result = []

    for (let i = 0; i < coords.length; i += 2) {
      result.push(...transformCoord(transformOptions, [coords[i], coords[i + 1]]))
    }
  
    return result
  }
  
 export  function transformCoord(
    transformOptions: TransformOptions,
    point: Coord
  ): number[] {
    const {matrix, parentHeight} = transformOptions
    const [x, y] = point
    const [a, b, c, d, tx, ty] = matrix
  
    return [
      Math.round((a * x + b * y + tx)*10000)/10000,
      Math.round((parentHeight - (c * x + d * y + ty))*10000)/10000,
    ]
  }
  
  export function createRectPoints(
    transformOptions: TransformOptions,
    coords: number[]
  ): Coord[] {
    const [x, y, width, height] = coords
  
    const points:[number,number][] = [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
    ]
    return points.map((coordinates) => transformCoords(transformOptions, coordinates)) as Coord[]
  }


  export function calculateBottomRightCorner(coords:Coord[]):Coord{
   return  coords.reduce((coord, resultCoord)=>{
        if(!resultCoord || coord[0]>resultCoord[0]|| coord[1]>resultCoord[1]){
            return [...coord]
        }
        return resultCoord
    })
  }

  export function calculateTopLeftCorner(coords:Coord[]):Coord{
    return  coords.reduce((coord, resultCoord)=>{
         if(!resultCoord || coord[0]<resultCoord[0]|| coord[1]<resultCoord[1]){
             return [...coord]
         }
         return resultCoord
     })
   }

   export function isValid(point:RawShapeLayerSubPathPoint) {
    if (!hasExpectedType(point)) {
      return false
    }
  
    if (!point.Coords) {
      return false
    }
  
    return true
  }
  
  export function hasExpectedType(point:RawShapeLayerSubPathPoint) {
    const type =point.Type
    return ['Curve', 'Line', 'Move'].some((t) => t === type)
  }
  

  