import fromPairs from 'lodash/fromPairs.js'
import pick from 'lodash/pick.js'

import { findArtboardUsedComponents } from '../../utils/artboard.js'
import { asArray } from '../../utils/as.js'
import { buildParentsMap, getChildren, getVariantPropsFromName } from '../../utils/common-design.js'
import { keys } from '../../utils/common.js'
import firstCallMemo from '../../utils/decorators.js'
import { Page } from './page.js'

import type {
  ComponentDescriptor,
  FigmaArtboard,
  FigmaFile,
  FigmaGroupLike,
  FigmaLayer,
  SourceComponent,
  TargetIds,
} from '../../types/figma.js'
import type { Artboard } from './artboard.js'
import type { Node } from './node.js'

type Variant = { name: string; id: string }
type ComponentSet = {
  name: string
  id: string
  variants: Variant[]
}
type ComponentSetMeta = {
  componentSetId: string
  componentSetName: string
  componentName: string
  componentProps: Record<string, string>
}
type ComponentSetsMetaMap = { [key: string]: ComponentSetMeta }
type SourceComponentsMap = { [key: string]: SourceComponent }
type FileOptions = { file: FigmaFile }

export class File {
  private _file: FigmaFile
  private _pages: Page[]

  constructor(options: FileOptions) {
    this._file = options.file
    this._pages = this._initPages()
  }

  get raw(): FigmaFile {
    return this._file
  }

  get documentRaw(): FigmaFile['document'] {
    return this._file?.document
  }

  get componentsRaw(): FigmaFile['components'] {
    return Object(this._file.components)
  }

  private _initPages(): Page[] {
    return getChildren(this.documentRaw).reduce<Page[]>((pages, page) => {
      if (page?.type === 'CANVAS') pages.push(new Page({ page }))
      return pages
    }, [])
  }

  private _findDefaultTargetArtboards(): Artboard[] {
    return this._pages.reduce<Artboard[]>((artboards, page) => {
      artboards.push(...page.getTopLevelArtboards())
      return artboards
    }, [])
  }

  @firstCallMemo()
  private get _layersHierarchyList(): Map<FigmaGroupLike, FigmaFile['document'] | FigmaGroupLike> {
    return new Map(buildParentsMap<FigmaGroupLike, FigmaFile['document']>(this.documentRaw))
  }

  findTargetArtboards(ids: string[]): FigmaArtboard[] {
    return this.flatLayers.filter((entity) => {
      return 'id' in entity ? ids.includes(entity?.id) : false
    }) as FigmaArtboard[]
  }

  @firstCallMemo()
  get idParentsMap(): Record<string, FigmaGroupLike> {
    return fromPairs(
      [...this._layersHierarchyList.entries()].map(([node, parent]) => {
        return [node?.id, parent]
      })
    ) as Record<string, FigmaGroupLike>
  }

  @firstCallMemo()
  get flatLayers(): FigmaGroupLike[] {
    return [...this._layersHierarchyList.keys()]
  }

  @firstCallMemo()
  get componentIds(): string[] {
    return keys(this.componentsRaw)
  }

  @firstCallMemo()
  get localComponents(): FigmaLayer[] {
    return (this.flatLayers as FigmaLayer[]).filter((node) => node?.type === 'COMPONENT')
  }

  @firstCallMemo()
  get localComponentIds(): string[] {
    return this.localComponents.map((node) => node?.id)
  }

  @firstCallMemo()
  get remoteComponentIds(): string[] {
    const local = this.localComponentIds
    return this.componentIds.filter((id: string) => !local.includes(id))
  }

  getParentOf(id: string): FigmaGroupLike | null {
    return this.idParentsMap[id] || null
  }

  getRemoteComponentsDescriptorsByIds(ids: string[]): ComponentDescriptor[] {
    const targets: SourceComponentsMap = pick(this.componentsRaw, ids)
    return keys(targets).map((key) => ({ ...targets[key], localId: key }))
  }

  @firstCallMemo()
  getTargetIds(): TargetIds {
    return {
      topLevelArtboards: this._findDefaultTargetArtboards().map((artboard) => {
        return artboard.id
      }),
      localComponents: this.localComponentIds,
      remoteComponents: this.remoteComponentIds,
    }
  }

  getScopedTargetIds(scopeIds: string[]): TargetIds {
    if (!asArray(scopeIds).length) return this.getTargetIds()

    const scopedArtboards = this.findTargetArtboards(scopeIds)
    const allUsedComponents = scopedArtboards.reduce((ids: string[], artboard) => {
      return [...ids, ...findArtboardUsedComponents(artboard)]
    }, []) as string[]
    return {
      topLevelArtboards: scopeIds,
      localComponents: this.localComponentIds.filter((id) => {
        return allUsedComponents.includes(id)
      }),
      remoteComponents: this.remoteComponentIds.filter((id) => {
        return allUsedComponents.includes(id)
      }),
    }
  }

  @firstCallMemo()
  get componentSetsMeta(): ComponentSet[] {
    return this.flatLayers.reduce((sets: ComponentSet[], layer) => {
      if (layer?.type !== 'COMPONENT_SET') return sets
      const csId = layer?.id
      const csName = layer?.name
      const variants = getChildren<FigmaArtboard>(layer).reduce((variants, variant) => {
        if (variant?.type !== 'COMPONENT') return variants
        const id = variant?.id
        const name = variant?.name
        return [...variants, { id, name }]
      }, [])
      return [...sets, { id: csId, name: csName, variants }]
    }, [])
  }

  @firstCallMemo()
  get componentSetsMetaMap(): ComponentSetsMetaMap {
    return fromPairs(
      this.componentSetsMeta.reduce((pairs, set) => {
        const current = set.variants.map((variant) => {
          return [
            variant.id,
            {
              componentSetId: set.id,
              componentSetName: set.name,
              componentName: variant.name,
              componentProps: getVariantPropsFromName(variant.name),
            },
          ]
        })
        return [...pairs, ...current]
      }, [])
    )
  }

  getVariantMetaOf(node: Node): ComponentSetMeta {
    return this.componentSetsMetaMap[node.id] || null
  }

  get pages(): Page[] {
    return this._pages
  }

  get schemaVersion(): string {
    return this._file?.schemaVersion
  }

  get styles(): FigmaFile['styles'] {
    return Object(this._file.styles) as FigmaFile['styles']
  }

  get name(): string {
    return this._file?.name
  }
}
