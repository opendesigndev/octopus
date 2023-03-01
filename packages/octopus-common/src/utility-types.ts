export type Defined<T> = Exclude<T, undefined>
export type NotNull<T> = Exclude<T, null>
export type NotEmpty<T> = Exclude<T, undefined | null>
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends Record<string, unknown> | void
    ? RecursivePartial<T[P]>
    : T[P]
}

export type ElementOf<T> = T extends Array<infer U> ? U : never
export type Nullish<T> = T | null | undefined
export type GetPromiseValue<T> = T extends Promise<infer U> ? U : never