import type { SourceArtboard } from '../../../entities/source/source-artboard.js'
import type { SourceDesign } from '../../../entities/source/source-design.js'
import type { ComponentConversionResult, DesignConversionResult } from '../design-converter/index.js'
import type { Exporter } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

export type AuxiliaryData = { metadata: string; additionalTextData: string | null }

export interface AIExporter extends Exporter {
  exportComponent?(component: ComponentConversionResult, role?: string): Promise<string>
  exportManifest?(manifest: DesignConversionResult): Promise<string>
  exportAuxiliaryData?(design: SourceDesign): Promise<AuxiliaryData>
  exportSourceArtboard?(artboard: SourceArtboard): Promise<string>
}
