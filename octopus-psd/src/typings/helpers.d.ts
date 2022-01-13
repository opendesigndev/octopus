export type Defined<T> = Exclude<T, undefined>
export type NotNull<T> = Exclude<T, null>
export type NotEmpty<T> = Exclude<T, undefined | null>
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | void
      ? RecursivePartial<T[P]>
      : T[P]
}
