import Vue from 'vue'
import { mergeData } from 'vue-functional-data-merge'

function generateName (name) {
  return name
    .toLowerCase()
    .replace(/\.svg$/, '')
    .replace(/[^a-z0-9-]/g, '-')
}

/**
 * Find sprite file name after nuxt build
 * @param {string} sprite Name of a sprite
 */
function getSpritePath (sprite) {
  const module = require('<%= relativeToBuild(options._output) %>/' + sprite + '.svg')
  if (typeof module === 'string') {
    return module
  }
  // nuxt-edge v3.0.0-26398097.20b0379b returns object instead of string
  if (typeof module === 'object' && typeof module.default === 'string') {
    return module.default
  }
  return ''
}

function getIcon (info) {
  const { icon, sprite } = info

  return getSpritePath(sprite) + `#i-${generateName(icon)}`
}

function getInfo (name) {
  let [sprite, icon] = name.split('/')

  if (!icon) {
    icon = sprite
    sprite = '<%= options.defaultSprite %>'
  }

  return {
    icon,
    sprite
  }
}

// @vue/component
const SvgIcon = {
  name: 'SvgIcon',
  functional: true,
  props: {
    name: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: null
    },
    desc: {
      type: String,
      default: null
    },
    viewBox: {
      type: String,
      default: null,
      validator (value) {
        return value.split(' ').every((v) => {
          return !isNaN(parseInt(v))
        })
      }
    }
  },
  render (h, { props, data }) {
    const info = getInfo(props.name)
    const icon = getIcon(info)

    const use = h('use', {
      attrs: {
        // Since SVG 2, the xlink:href attribute is deprecated in favor of simply href.
        href: icon,
        // xlink:href can still be required in practice for cross-browser compatibility.
        'xlink:href': icon
      }
    })

    const title = props.title ? h('title', props.title) : null
    const desc = props.desc ? h('desc', props.desc) : null

    const { sprite } = info

    const componentData = {
      class: '<%= options.elementClass %> <%= options.spriteClassPrefix %>' + sprite,
      attrs: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: props.viewBox
      }
    }

    return h('svg',
      mergeData(data, componentData),
      [title, desc, use].filter(Boolean)
    )
  }
}

Vue.component(SvgIcon.name, SvgIcon)
