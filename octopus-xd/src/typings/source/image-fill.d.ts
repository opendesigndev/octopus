export type RawImageFill = {
  type?: 'pattern' | 'none',
  pattern?: {
    width?: number,
    height?: number,
    meta?: {
      ux?: {
        scaleBehavior?: 'fill' | 'cover',
        uid?: string,
        hrefLastModifiedDate?: number,
      }
    },
    href?: string
  }
}