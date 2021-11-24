import { defineNuxtConfig } from '@nuxt/bridge'

export default defineNuxtConfig({
  head: {
    title: 'Nuxt.js SVG Sprite Module',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },
  modules: [
    '../../src'
  ]
})
