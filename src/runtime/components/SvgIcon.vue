<template>
  <svg :view-box="viewBox" :class="svgClass">
    <title v-if="title">{{ title }}</title>
    <desc v-if="desc">{{ desc }}</desc>
    <use :href="icon.url" />
  </svg>
</template>

<script>
export default {
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
  data () {
    return {
      icon: {
        sprite: '',
        icon: '',
        url: ''
      }
    }
  },
  async fetch () {
    this.icon = await this.$svgSprite.getIcon(this.name)
  },
  computed: {
    svgClass () {
      return `${this.$svgSprite.spriteClass} ${this.$svgSprite.spriteClassPrefix}${this.icon.sprite}`
    }
  }
}
</script>
