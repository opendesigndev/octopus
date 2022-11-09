export type BenchmarkSimpleExport = [string, number]

export interface IBenchmarkSimple {
  end(): number
  export(): BenchmarkSimpleExport | null
}
