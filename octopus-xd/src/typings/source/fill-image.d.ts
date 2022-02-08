export type RawFillImage = {
  type?: 'pattern' | 'none',
  pattern?: {
    width?: number,
    height?: number,
    meta?: {
      ux?: {
        scaleBehavior?: 'fill' | 'cover',
        uid?: string,
        hrefLastModifiedDate?: number,
        offsetX?: number,
        offsetY?: number,
        scale?: number,
        scaleX?: number,
        scaleY?: number,
        flipX?: boolean,
        flipY?: boolean
      }
    },
    href?: string
  }
}