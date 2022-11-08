import { createOctopusArtboardFileName } from '../exporter'

describe('utils/exporter', () => {
  describe('createOctopusArtboardFileName', () => {
    it('returns octopusArtboardFileName', () => {
      expect(createOctopusArtboardFileName('1')).toEqual('octopus-1.json')
    })
  })
})