import { defineNuxtConfig } from 'nuxt/config'
import consola from 'consola'

const alias = {}

if (process.env.NODE_ENV === 'development') {
  consola.warn('Using local @nuxtjs/svg-sprite!')
  alias['@nuxtjs/svg-sprite'] = '../src/module.ts'
}

export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  alias,
  modules: [
    '@nuxtjs/svg-sprite'
  ]
})
