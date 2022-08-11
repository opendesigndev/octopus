import md5 from 'blueimp-md5'

export function uuidv4FromSeed(seed: string): string {
  return md5(seed).replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/g, (_, g1, g2, g3, g4, g5) => {
    return `${g1}-${g2}-4${g3.slice(0, 3)}-a${g4.slice(0, 3)}-${g5}`
  })
}
