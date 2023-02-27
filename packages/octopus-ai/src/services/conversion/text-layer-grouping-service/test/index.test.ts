/* eslint-disable @typescript-eslint/no-explicit-any */

import { TextLayerGroupingservice } from '../index.js'

describe('TextLayerGroupingservice', () => {
  it('groups text layers and selects shortests matching additionalTextData', () => {
    const privateData = {
      TextLayers: [
        {
          content: 'Hello world! + extra text',
          index: 0,
        },
        {
          content: 'Hello world! + extra longer text',
          index: 1,
        },
      ],
    } as any

    const sourceLayersInput = [
      { textValue: 'Hello ', type: 'TextGroup' },
      { textValue: 'world!', type: 'TextGroup' },
      { type: 'ShapeLayer' },
    ] as any

    const textLayerGroupingService = new TextLayerGroupingservice(privateData)

    const [
      {
        sourceLayers: [sourceLayerText1, sourceLayerText2],
        additionalTextDataText,
      },
      {
        sourceLayers: [sourceLayerShape],
      },
    ] = textLayerGroupingService.getLayerSequences(sourceLayersInput)

    expect(sourceLayerText1).toEqual(sourceLayersInput[0])
    expect(sourceLayerText2).toEqual(sourceLayersInput[1])
    expect(sourceLayerShape).toEqual(sourceLayersInput[2])
    expect(additionalTextDataText).toEqual(privateData.TextLayers[0])
  })

  it('it replaces special characters in resulting additionalTextDataText ', () => {
    const privateData = {
      TextLayers: [
        {
          content: 'H\rel\r\rlo wor\u0003ld!\t + extra text',
          index: 0,
        },
      ],
    } as any

    const resultingAditionalTextDataContent = 'H\nel\u2029lo wor\u2029ld!  + extra text'
    const sourceLayersInput = [
      { textValue: 'Hello ', type: 'TextGroup' },
      { textValue: 'world!', type: 'TextGroup' },
    ] as any

    const textLayerGroupingService = new TextLayerGroupingservice(privateData)

    const [{ additionalTextDataText }] = textLayerGroupingService.getLayerSequences(sourceLayersInput)

    expect(additionalTextDataText?.content).toEqual(resultingAditionalTextDataContent)
  })

  it('it does not use private data match more than once', () => {
    const privateData = {
      TextLayers: [
        {
          content: 'Hello world! + extra text',
          index: 0,
        },
        {
          content: 'Hello world! + extra longer text',
          index: 1,
        },
      ],
    } as any

    const sourceLayersInput = [
      { textValue: 'Hello ', type: 'TextGroup' },
      { textValue: 'Hello', type: 'TextGroup' },
    ] as any

    const textLayerGroupingService = new TextLayerGroupingservice(privateData)

    const [
      {
        sourceLayers: [sourceLayerText1],
        additionalTextDataText: private1,
      },
      {
        sourceLayers: [sourceLayerText2],
        additionalTextDataText: private2,
      },
    ] = textLayerGroupingService.getLayerSequences(sourceLayersInput)

    expect(sourceLayerText1).toEqual(sourceLayersInput[0])
    expect(sourceLayerText2).toEqual(sourceLayersInput[1])
    expect(private1).toEqual(privateData.TextLayers[0])
    expect(private2).toEqual(privateData.TextLayers[1])
  })
})
