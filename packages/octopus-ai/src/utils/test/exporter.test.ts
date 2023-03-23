import { describe, expect, it } from 'vitest'

import { createOctopusArtboardFileName } from '../exporter.js'

describe('utils/exporter', () => {
  describe('createOctopusArtboardFileName', () => {
    it('returns octopusArtboardFileName', () => {
      expect(createOctopusArtboardFileName('1')).toEqual('octopus-1.json')
    })
  })
})
