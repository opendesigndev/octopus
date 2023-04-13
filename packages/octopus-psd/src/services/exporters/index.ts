import type { Exporter } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'
import { SourceComponent } from '../../entities/source/source-component.js'
import { ComponentConversionResult, DesignConversionResult } from '../conversion/design-converter.js'

export interface PSDExporter extends Exporter {
  exportComponent?(component: ComponentConversionResult, role?: string): Promise<string | null>
  exportManifest?(manifest: DesignConversionResult): Promise<string>
}
