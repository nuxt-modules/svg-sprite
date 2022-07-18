import { defineNuxtConfig } from 'nuxt'
import consola from 'consola'

const alias = {}

if (process.env.NODE_ENV === 'development') {
  consola.warn('Using local @nuxtjs/svg-sprite!')
  alias['@nuxtjs/svg-sprite'] = '../src/module.ts'
}

export default defineNuxtConfig({
  extends: ['./node_modules/@docus/docs-theme'],
  github: {
    owner: 'nuxt-community',
    repo: 'svg-sprite-module',
    branch: 'main'
  },
  theme: {},
  content: {
    navigation: {
      fields: ['exact']
    }
  },
  alias,
  modules: ['@nuxthq/admin', '@docus/github', '@nuxtjs/svg-sprite'],
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#d6ffee',
              100: '#acffdd',
              200: '#83ffcc',
              300: '#30ffaa',
              400: '#00dc82',
              500: '#00bd6f',
              600: '#009d5d',
              700: '#007e4a',
              800: '#005e38',
              900: '#003f25'
            }
          }
        }
      }
    }
  }
})
