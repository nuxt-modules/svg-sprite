// @ts-ignore
import { sprites, defaultSprite, spriteClass, spriteClassPrefix } from '#svg-sprite'
// @ts-ignore
import { icons } from '#svg-sprite-icons'

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

  const generatedName = generateName(icon)

  if (!icons.includes(`${sprite}/${generatedName}`) && icon.match(/\w:/)) {
    const [collection, _icon] = icon.split(':')
    await $fetch('/api/svg-sprite/generate', { params: { sprite, icon: _icon, collection } })
  }

  /**
   * Find sprite file name after nuxt build
   */
  const spriteFile = sprites[sprite] ? await sprites[sprite]() : ''

  return {
    sprite,
    icon,
    url: spriteFile + `#${generatedName}`,
    class: `${spriteClass} ${spriteClassPrefix}${sprite}`
  }
}
