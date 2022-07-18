import {
  resolveAlias,
  defineNuxtModule,
  resolveModule,
  addTemplate,
  createResolver,
  addComponent,
  addAutoImport,
  useLogger
} from '@nuxt/kit'
import type { OptimizeOptions } from 'svgo'
import inlineDefs from './svgo-plugins/inlineDefs'
import { iconsTemplate, spritesTemplate } from './template'
import { createSpritesManager, useSvgFile } from './utils'

export interface ModuleOptions {
  input?: string
  output?: string
  iconsPath: string
  defaultSprite?: string
  optimizeOptions?: OptimizeOptions
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjs/svg-sprite',
    configKey: 'svgSprite',
    compatibility: {
      bridge: true
    }
  },
  defaults: {
    input: '~/assets/sprite/svg',
    output: '~/assets/sprite/gen',
    defaultSprite: 'icons',
    iconsPath: '/_icons',
    optimizeOptions: {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
              // Make all styles inline By definition, a defs sprite is not usable as a CSS sprite
              inlineStyles: {
                onlyMatchedOnce: false
              },
              cleanupIDs: {}
            }
          }
        },
        { name: 'removeXMLNS', active: true },
        // Disable removeViewBox plugin and enable removeDimensions
        { name: 'removeDimensions' },
        // Enable removeAttrs plugin, Remove id attribute to prevent conflict with our id
        {
          name: 'removeAttrs',
          params: {
            attrs: 'svg:id'
          }
        },
        inlineDefs
      ]
    }
  },
  async setup (options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolveModule(path, { paths: resolve('./runtime') })
    const outDir = resolveAlias(options.output, nuxt.options.alias)

    const logger = useLogger('svg-sprite')

    await addComponent({ name: 'SvgIcon', filePath: resolve('./runtime/components/component.vue'), global: true })
    await addAutoImport({ name: 'useSprite', as: 'useSprite', from: resolveRuntimeModule('./composables/useSprite') })

    const { sprites, addSvg, removeSvg, generateSprite } = createSpritesManager(options.optimizeOptions)
    nuxt.options.alias['#svg-sprite'] = addTemplate({
      ...spritesTemplate,
      options: {
        sprites,
        outDir,
        defaultSprite: options.defaultSprite
      }
    }).dst

    // Register icons page
    if (options.iconsPath) {
      // Add layout
      nuxt.options.layouts['svg-sprite'] = resolve('runtime/components/layout.vue')

      // Add template
      nuxt.options.alias['#svg-sprite-icons'] = addTemplate({
        ...iconsTemplate,
        options: {
          sprites,
          outDir,
          defaultSprite: options.defaultSprite
        }
      }).dst

      // Register route
      nuxt.hook('build:extendRoutes', (routes) => {
        routes.unshift({
          name: 'icons-page',
          path: options.iconsPath,
          component: resolve('runtime/components/icons-page.vue')
        })
      })
    }

    nuxt.hook('nitro:init', async (nitro) => {
      const input = options.input.replace(/~|\.\//, 'root').replace(/\//g, ':')
      const output = options.output.replace(/~|\.\//, 'root').replace(/\//g, ':')

      // Make sure output directory exists and contains .gitignore to ignore sprite files
      if (!await nitro.storage.hasItem(`${output}:.gitignore`)) {
        await nitro.storage.setItem(`${output}:.gitignore`, '*')
      }

      const svgs = await nitro.storage.getKeys(input).then(keys => keys.map(key => key.substring(input.length + 1)))
      await Promise.all(
        svgs.map(async (file) => {
          const { name, sprite } = useSvgFile(file)

          return addSvg({
            name,
            sprite: sprite || options.defaultSprite,
            content: await nitro.storage.getItem(`${input}:${file}`) as string
          })
        })
      )

      const writeSprite = (sprite: string) => nitro.storage.setItem(`${output}:${sprite}.svg`, generateSprite(sprite))
      await Promise.all(Object.keys(sprites).map(writeSprite))

      // Rest of the code is only for development
      if (!nuxt.options.dev) {
        return
      }

      const handleFileChange = async (event, file) => {
        if (!file.startsWith(input)) {
          return
        }

        file = file.substring(input.length + 1)
        const { name, sprite } = useSvgFile(file)

        if (event === 'update') {
          logger.log(`${file} changed`)
          await addSvg({
            name,
            sprite: sprite || options.defaultSprite,
            content: await nitro.storage.getItem(`${input}:${file}`) as string
          })
        } else if (event === 'remove') {
          logger.log(`${file} removed`)
          removeSvg(sprite, name)
        }
        await writeSprite(sprite || options.defaultSprite)
      }
      nitro.storage.watch((event, file) => handleFileChange(event, file))
    })
  }
})
