export function getConverted<T extends { convert: () => unknown }>(
    entities: T[]
  ): Exclude<ReturnType<T['convert']>, null>[] {
    return entities.map(entity => {
      return entity.convert()
    }).filter(converted => {
      return converted
    }) as Exclude<ReturnType<T['convert']>, null>[]
  }