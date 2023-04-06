import type { Octopus as OctopusRaw } from '@opendesign/octopus-ts'

export type Octopus = OctopusRaw['schemas']

export type GenericComponentConversionResult<T extends object> = {
  id: string
  value: T | null
  error: Error | null
  time: number
}

export type GenericDesignConversionResult<T extends object> = {
  manifest: T
  time: number
}
