import sizeOf from 'image-size'

import type { ImageSize } from './image-size'

export async function imageSize(buffer: ArrayBuffer): Promise<ImageSize | undefined> {
  if (!buffer.byteLength) return undefined
  const { width, height } = await sizeOf(Buffer.from(buffer))
  if (typeof width !== 'number') return undefined
  if (typeof height !== 'number') return undefined
  return { width, height }
}
