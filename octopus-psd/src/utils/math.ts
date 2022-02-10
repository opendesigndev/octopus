export function mod(n: number, mod: number): number {
  const remainder = n % mod
  return remainder >= 0 ? remainder : remainder + mod
}

export function tan(degrees: number) {
  return Math.tan((degrees * Math.PI) / 180)
}
