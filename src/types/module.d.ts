export interface SVGSymbol {
  name: string
  sprite: string
  path: string
  content: string
  defs: string[]
}

export interface SVGSprite {
  name: string
  defaultSprite?: boolean
  symbols: { [key: string]: SVGSymbol }
}
