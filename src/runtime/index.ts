import Vue from 'vue'
import { SvgSpriteRuntimeOptions } from 'types'
import SvgIcon from './components/SvgIcon'

Vue.component('SvgIcon', SvgIcon)

function generateName (name) {
  return name
    .toLowerCase()
    .replace(/\.svg$/, '')
    .replace(/[^a-z0-9-]/g, '-')
}

export default function svgSprite (options: SvgSpriteRuntimeOptions) {
  async function getIcon (name) {
    let [sprite, icon] = name.split('/')

    if (!icon) {
      icon = sprite
      sprite = options.defaultSprite
    }

    /**
     * Find sprite file name after nuxt build
     * @param {string} sprite Name of a sprite
     */
    const spriteFile = await options.importSprite(sprite).then(res => res.default || res)

    return { sprite, icon, url: spriteFile + `#i-${generateName(icon)}` }
  }
  return {
    getIcon,
    modern: options.modern,
    spriteClassPrefix: options.spriteClassPrefix,
    spriteClass: options.spriteClass
  }
}
