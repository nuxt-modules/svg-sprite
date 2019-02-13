import Vue from 'vue'

function generateName(name) {
  return name
    .toLowerCase()
    .replace(/\.svg$/, '')
    .replace(/[^a-z0-9-]/g, '-')
}

// @vue/component
const svgIcon = {
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
    }
  },
  computed: {
    icon() {
      let [sprite, icon] = this.name.split('/')

      if (!icon) {
        icon = sprite
        sprite = '<%= options.defaultSprite %>'
      }

      return require('<%= relativeToBuild(options.output) %>/' + sprite + '.svg') +
                `#i-${generateName(icon)}`
    }
  },
  render(h) {
    const use = h('use', {
      attrs: {
        'xlink:href': this.icon
      }
    })
    const title = this.title ? h('title', this.title) : null
    const desc = this.desc ? h('desc', this.desc) : null
    return h('svg', {
      attrs: {
        xmlns: 'http://www.w3.org/2000/svg'
      }
    },
    [ title, desc, use ].filter(Boolean)
    )
  }
}

Vue.component('svgIcon', svgIcon)
