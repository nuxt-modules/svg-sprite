export interface SvgSpriteRuntimeOptions {
  importSprite: (key: string) => Promise<any>
  modern: boolean
  defaultSprite: string
  spriteClassPrefix: string
  spriteClass: string
}
