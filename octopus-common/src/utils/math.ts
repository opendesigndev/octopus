export function mod(n: number, mod: number): number {
  const remainder = n % mod
  return remainder >= 0 ? remainder : remainder + mod
}

export function round(n: number, precision = 2): number {
  const multiplier = Math.pow(10, precision)
  return Math.round(n * multiplier) / multiplier
}

export function clamp(x: number, min: number, max: number): number {
  return Math.max(Math.min(x, max), min)
}

export function sin(degrees: number): number {
  return Math.sin((degrees * Math.PI) / 180)
}

export function cos(degrees: number): number {
  return Math.cos((degrees * Math.PI) / 180)
}

export function tan(degrees: number): number {
  return Math.tan((degrees * Math.PI) / 180)
}
