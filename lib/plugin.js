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
    return h('svg', {
      attrs: {
        xmlns: 'http://www.w3.org/2000/svg'
      }
    }, [
      h('use', {
        attrs: {
          'xlink:href': this.icon
        }
      })
    ])
  }
}

Vue.component('svgIcon', svgIcon)
