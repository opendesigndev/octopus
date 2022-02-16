
function createSimplePoint(coordinates: number[]) {
  return createPoint('point', coordinates)
}

 function createBezierPoint(coordinates: number[]) {
  return createPoint('bezier', coordinates)
}

function createPoint(type: string, coordinates: number[]) {
  return {type, coordinates}
}


export type OctopusPoint = {
    type: string,
    coordinates: number[]
  }

export default class Point {
    coords: number[]
    outBezier?: number[] | null
    inBezier?: number[] | null
  
    constructor(coords: number[]) {
      this.coords = coords
      this.outBezier = null
      this.inBezier = null
    }
  
    toOctopus(): OctopusPoint {
      if (!this.outBezier && !this.inBezier) {
        return createSimplePoint([...this.coords])
      }
  
      this.outBezier = this.outBezier || this.coords
      this.inBezier = this.inBezier || this.coords
      const coords = [...this.inBezier, ...this.outBezier, ...this.coords]
      
      return createBezierPoint(coords)
    }
  }