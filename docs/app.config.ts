export default defineAppConfig({
  docus: {
    title: 'Nuxt SVG Sprite',
    layout: 'default',
    url: 'https://color-mode.nuxtjs.org',
    description: 'Optimized and Easy way to use SVG files in Nuxt.js',
    socials: {
      twitter: 'nuxt_js',
      github: 'nuxt-community/svg-sprite-module'
    },
    aside: {
      level: 1
    },
    image: '/cover.jpg',
    header: {
      logo: false
    },
    footer: {
      credits: {
        icon: 'IconDocus',
        text: 'Powered by Docus',
        href: 'https://docus.com'
      },
      iconLinks: [
        {
          label: 'Nuxt',
          href: 'https://nuxt.com',
          icon: 'IconNuxt'
        },
        {
          label: 'Vue Telescope',
          href: 'https://vuetelescope.com',
          icon: 'IconVueTelescope'
        }
      ]
    }
  }
})
