import { imageSize as sizeOf } from 'image-size'

import type { ImageSize } from './image-size.js'

export async function imageSize(buffer: ArrayBuffer): Promise<ImageSize | undefined> {
  if (!buffer.byteLength) return undefined
  const { width, height } = sizeOf(Buffer.from(buffer))
  if (typeof width !== 'number') return undefined
  if (typeof height !== 'number') return undefined
  return { width, height }
}
