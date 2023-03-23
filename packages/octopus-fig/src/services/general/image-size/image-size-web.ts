import type { ImageSize } from './image-size.js'

export async function imageSize(buffer: ArrayBuffer): Promise<ImageSize> {
  return new Promise<ImageSize>((resolve, reject) => {
    try {
      const img = new Image()
      img.src = URL.createObjectURL(new Blob([buffer]))
      img.onload = () => {
        const { width, height } = img
        resolve({ width, height })
      }
    } catch (e) {
      reject(e)
    }
  })
}
