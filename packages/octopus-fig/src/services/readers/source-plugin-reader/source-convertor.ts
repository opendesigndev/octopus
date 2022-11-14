/* eslint-disable @typescript-eslint/no-explicit-any */
import isArray from 'lodash/isArray'

import type { RawLayer } from '../../../typings/raw'

function fixGeometry(geometry: any): any {
  if (geometry && geometry.data && geometry.path === undefined) {
    geometry.path = geometry.data
    delete geometry.data
  }
}

export function convert(raw: any): RawLayer {
  const { type } = raw

  // missing Size fix
  const { size, width, height } = raw
  if (!size && (width || height)) {
    raw.size = { x: width, y: height }
  }

  // missing Geometry Path fix
  const { fillGeometry, strokeGeometry } = raw
  if (isArray(fillGeometry)) fillGeometry.forEach(fixGeometry)
  if (isArray(strokeGeometry)) strokeGeometry.forEach(fixGeometry)

  // CornerRadii fix
  const { cornerRadius, rectangleCornerRadii, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius } = raw
  if (cornerRadius === 'Mixed') {
    if (!rectangleCornerRadii) {
      raw.rectangleCornerRadii = [
        topLeftRadius ?? 0,
        topRightRadius ?? 0,
        bottomLeftRadius ?? 0,
        bottomRightRadius ?? 0,
      ]
      delete raw.topLeftRadius
      delete raw.topRightRadius
      delete raw.bottomLeftRadius
      delete raw.bottomRightRadius
    }
    delete raw.cornerRadius
  }

  // strokeCap Mixed fix
  const { strokeCap } = raw
  if (strokeCap === 'Mixed') {
    raw.strokeCap = 'NONE'
  }

  // shape type Polygon fix
  if (type === 'POLYGON') {
    raw.type = 'REGULAR_POLYGON'
  }

  // BOOLEAN_OPERATION transform fix
  if (type === 'BOOLEAN_OPERATION') {
    raw.relativeTransform = [
      [1, 0, 0],
      [0, 1, 0],
    ]
  }

  if (isArray(raw.children)) {
    raw.children = raw.children.map((child: unknown) => convert(child))
  }

  return raw
}
