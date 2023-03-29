import type { Manifest as ManifestRaw } from '@opendesign/manifest-ts'
import type { Octopus as OctopusRaw } from '@opendesign/octopus-ts'

export type Manifest = ManifestRaw['schemas']
export type Octopus = OctopusRaw['schemas']

export type ComponentConversionResult = {
  id: string
  value: Octopus['OctopusComponent'] | null
  error: Error | null
  time: number
}

export type DesignConversionResult = {
  manifest: Manifest['OctopusManifest']
  time: number
}
