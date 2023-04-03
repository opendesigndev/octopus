import type { Octopus as OctopusRaw } from '@opendesign/octopus-ts'

export type Octopus = OctopusRaw['schemas']

export type ComponentMeta = { id: string; name: string; role: 'ARTBOARD' | 'COMPONENT' }
export type PageMeta = { id: string; name: string; children: ComponentMeta[] }
export type Origin = { name: 'FIGMA' | 'ILLUSTRATOR' | 'XD' | 'PHOTOSHOP'; version: string }

export type DesignMeta = {
  pages: PageMeta[]
  components: ComponentMeta[]
  name: string
  origin: Origin
}
