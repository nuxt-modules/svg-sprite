<template>
  <svg :viewBox="viewBox" :class="icon.class">
    <title v-if="title">{{ title }}</title>
    <desc v-if="desc">{{ desc }}</desc>
    <use :href="icon.url" />
  </svg>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
// @ts-ignore
import { useSprite } from '#imports'

const props = defineProps({
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
    validator (value: string) {
      return value.split(' ').every((v) => {
        return !isNaN(parseInt(v))
      })
    }
  }
})

const icon = ref({
  url: '',
  class: ''
})

icon.value = await useSprite(props.name)

watch(() => props.name, async (name) => {
  icon.value = await useSprite(name)
})
</script>
