// @ts-ignore
import { sprites, defaultSprite, spriteClass, spriteClassPrefix } from '#svg-sprite'

function generateName (name: string) {
  return name
    .toLowerCase()
    .replace(/\.svg$/, '')
    .replace(/[^a-z0-9-:]/g, '-')
    .replace(/:/g, '--')
}

export const useSprite = async (name: string) => {
  let [sprite, icon] = name.split('/')

  if (!icon) {
    icon = sprite
    sprite = defaultSprite
  }

  /**
   * Find sprite file name after nuxt build
   */
  const spriteFile = sprites[sprite] ? await sprites[sprite]() : ''

  return {
    sprite,
    icon,
    url: spriteFile + `#${generateName(icon)}`,
    class: `${spriteClass} ${spriteClassPrefix}${sprite}`
  }
}
