<template>
  <svg :view-box="viewBox" :class="icon.class">
    <title v-if="title">{{ title }}</title>
    <desc v-if="desc">{{ desc }}</desc>
    <use :href="icon.url" />
  </svg>
</template>

<script lang="ts">
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
        url: '',
        class: ''
      }
    }
  },
  async fetch () {
    this.icon = await useSprite(this.name)
  }
}
</script>
