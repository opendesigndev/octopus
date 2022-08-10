import { Node } from '../entities/structural/node.js'
import { getChildren } from './common-design.js'

function _getComponentSetComponents(componentSet: Node): Node[] {
  const { designId } = componentSet

  return getChildren(componentSet.document).reduce((ungrouped: Node[], layer) => {
    if (layer?.type !== 'COMPONENT') return ungrouped
    return [
      ...ungrouped,
      new Node({ node: { ...componentSet.raw, document: layer }, id: { designId, nodeId: layer.id } }),
    ]
  }, [])
}

export function unwrap(sourceNodes: Node[]): Node[] {
  return sourceNodes.reduce((normalized, sourceNode) => {
    return sourceNode.type === 'COMPONENT_SET'
      ? [...normalized, ..._getComponentSetComponents(sourceNode)]
      : [...normalized, sourceNode]
  }, [])
}
