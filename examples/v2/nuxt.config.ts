export default {
  head: {
    title: 'Nuxt.js SVG Sprite Module',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ]
  },
  buildModules: [
    '@nuxt/typescript-build'
  ],
  modules: [
    '../../src/index.ts'
  ],
  svgSprite: {

  }
}
