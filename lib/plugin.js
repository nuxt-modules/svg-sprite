import Vue from 'vue'

function generateName(name) {
  return name
    .toLowerCase()
    .replace(/\.svg$/, '')
    .replace(/[^a-z0-9-]/g, '-')
}

// @vue/component
const SvgIcon = {
  name: 'SvgIcon',
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
  computed: {
    icon() {
      let [sprite, icon] = this.name.split('/')

      if (!icon) {
        icon = sprite
        sprite = '<%= options.defaultSprite %>'
      }

      return require('<%= relativeToBuild(options._output) %>/' + sprite + '.svg') +
                `#i-${generateName(icon)}`
    }
  },
  render(h) {
    const use = h('use', {
      attrs: {
        // Since SVG 2, the xlink:href attribute is deprecated in favor of simply href.
        href: this.icon,
        // xlink:href can still be required in practice for cross-browser compatibility.
        'xlink:href': this.icon
      }
    })
    const title = this.title ? h('title', this.title) : null
    const desc = this.desc ? h('desc', this.desc) : null
    return h('svg', {
      attrs: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: this.viewBox
      }
    },
    [ title, desc, use ].filter(Boolean)
    )
  }
}

Vue.component(SvgIcon.name, SvgIcon)
