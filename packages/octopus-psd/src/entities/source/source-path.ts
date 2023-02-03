import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import { createSourcePathComponents, mergeBounds } from '../../utils/path.js'
import { getBoundsFor } from '../../utils/source.js'
import { SourceEntity } from './source-entity.js'
import { SourcePathComponent } from './source-path-component.js'

import type { RawBounds, RawVectorMaskSetting, RawVectorOriginationData } from '../../typings/raw'
import type { DocumentDimensions, SourceBounds } from '../../typings/source'

type SourcePathOptions = {
  vectorOriginationData: RawVectorOriginationData | undefined
  vectorMaskSetting: RawVectorMaskSetting | undefined
  documentDimensions: DocumentDimensions
}
export class SourcePath extends SourceEntity {
  private _vectorOriginationData: RawVectorOriginationData | undefined
  private _vectorMaskSetting: RawVectorMaskSetting | undefined
  private _documentDimensions: DocumentDimensions

  constructor(options: SourcePathOptions) {
    super(options.vectorMaskSetting)

    this._vectorOriginationData = options.vectorOriginationData
    this._vectorMaskSetting = options.vectorMaskSetting
    this._documentDimensions = options.documentDimensions
  }

  get bounds(): SourceBounds {
    const boundsArr = asArray(this._vectorOriginationData?.keyDescriptorList)
      .map((descriptor) => descriptor.keyOriginShapeBBox)
      .filter((bound): bound is RawBounds => Boolean(bound))

    return getBoundsFor(mergeBounds(boundsArr))
  }

  @firstCallMemo()
  get pathComponents(): SourcePathComponent[] {
    const componentsPsd = createSourcePathComponents(
      asArray(this._vectorMaskSetting?.pathRecords),
      asArray(this._vectorOriginationData?.keyDescriptorList),
      this._documentDimensions
    )

    return componentsPsd.map((component) => new SourcePathComponent(component))
  }

  get documentDimensions(): DocumentDimensions {
    return this._documentDimensions
  }

  get vectorMaskSetting(): RawVectorMaskSetting | undefined {
    return this._vectorMaskSetting
  }

  get vectorOriginationData(): RawVectorOriginationData | undefined {
    return this._vectorOriginationData
  }
}
