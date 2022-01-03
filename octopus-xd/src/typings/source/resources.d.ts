import { RawClipPathResources, RawGradientResources, RawLayer } from '.'

export type RawResources = {
  version?: string,
  children?: [],
  resources?: {
    meta?: {
      ux?: {
        colorSwatches?: [],
        documentLibrary?: {
          version?: number,
          isStickerSheet?: boolean,
          hashedMetadata?: {
            publishedDocLibId?: null
          },
          elements?: [],
          groupData?: {
            groups?: []
          }
        },
        gridDefaults?: {
          defaultGrid?: null,
          layoutOverrides?: null
        },
        symbols?: RawLayer[],
        symbolsMetadata?: {
          usingNestedSymbolSyncing?: boolean
        }
      }
    },
    gradients?: {
      [key: string]: RawGradientResources
    },
    clipPaths?: {
      [key: string]: RawClipPathResources
    }
  },
  artboards?: {
    [key: string]: {
      width?: number,
      height?: number,
      name?: string,
      x?: number,
      y?: number,
      viewportHeight?: number
    }
  }
}
