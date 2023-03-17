import fsp from 'fs/promises'
import {
  resolveAlias,
  defineNuxtModule,
  resolveModule,
  addTemplate,
  createResolver,
  addComponent,
  addImports,
  useLogger,
  addLayout,
  addServerHandler,
  updateTemplates
} from '@nuxt/kit'
import type { Config as SVGOConfig } from 'svgo'
import inlineDefs from './svgo-plugins/inlineDefs'
import { iconsTemplate, spritesTemplate } from './template'
import { createSpritesManager, useSvgFile } from './utils'

export interface ModuleOptions {
  input: string
  output: string
  iconsPath: string
  defaultSprite: string
  optimizeOptions: SVGOConfig
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjs/svg-sprite',
    configKey: 'svgSprite',
    compatibility: {
      nuxt: '>=3.0.0'
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
              }
            }
          }
        },
        { name: 'cleanupIds', params: {} },
        { name: 'removeXMLNS' },
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
    const inputDir = resolveAlias(options.input, nuxt.options.alias)
    const outDir = resolveAlias(options.output, nuxt.options.alias)

    const logger = useLogger('svg-sprite')

    await addComponent({ name: 'SvgIcon', filePath: resolve('./runtime/components/svg-icon.vue'), global: true })
    if (nuxt.options.dev) {
      nuxt.options.runtimeConfig.svgSprite = { inputDir, defaultSprite: options.defaultSprite }
      addServerHandler({ route: '/api/svg-sprite/generate', handler: resolve('./runtime/server/generate') })
      await addImports({ name: 'useSprite', as: 'useSprite', from: resolveRuntimeModule('./composables/useSprite.dev') })
    } else {
      await addImports({ name: 'useSprite', as: 'useSprite', from: resolveRuntimeModule('./composables/useSprite') })
    }

    const { sprites, addSvg, removeSvg, generateSprite } = createSpritesManager(options.optimizeOptions)
    nuxt.options.alias['#svg-sprite'] = addTemplate({
      ...spritesTemplate,
      write: true,
      options: {
        sprites,
        outDir,
        defaultSprite: options.defaultSprite
      }
    }).dst

    // Register icons page
    if (options.iconsPath) {
      // Add layout
      addLayout({
        filename: 'svg-sprite.vue',
        src: resolve('./runtime/components/layout.vue')
      })

      // Add template
      nuxt.options.alias['#svg-sprite-icons'] = addTemplate({
        ...iconsTemplate,
        write: true,
        options: {
          sprites,
          outDir,
          defaultSprite: options.defaultSprite
        }
      }).dst

      // Register route
      nuxt.hook('pages:extend', (routes) => {
        routes.unshift({
          name: 'icons-page',
          path: options.iconsPath,
          file: resolve('runtime/components/icons-page.vue'),
          meta: {
            layout: 'svg-sprite'
          }
        })
      })
    }

    nuxt.hook('nitro:init', async (nitro) => {
      const input = options.input.replace(/~|\.\//, 'root').replace(/\//g, ':')
      const output = options.output.replace(/~\/|\.\//, '')

      // Make sure output directory exists and contains .gitignore to ignore sprite files
      if (!await nitro.storage.hasItem(`${output}:.gitignore`)) {
        // await nitro.storage.setItem(`${output}:.gitignore`, '*')
        await fsp.mkdir(`${nuxt.options.rootDir}/${output}`, { recursive: true })
        await fsp.writeFile(`${nuxt.options.rootDir}/${output}/.gitignore`, '*')
      }

      const svgsFiles = await nitro.storage.getKeys(input)
      await Promise.all(
        svgsFiles.map(async (file: string) => {
          file = file.substring(input.length + 1)
          const { name, sprite } = useSvgFile(file, { defaultSprite: options.defaultSprite })

          return addSvg({
            name,
            sprite,
            content: await nitro.storage.getItem(`${input}:${file}`) as string
          })
        })
      )

      const writeSprite = async (sprite: string) => {
        await fsp.writeFile(`${nuxt.options.rootDir}/${output}/${sprite}.svg`, generateSprite(sprite))
        // return nitro.storage.setItem(`${output}:${sprite}.svg`, generateSprite(sprite))
      }
      await Promise.all(Object.keys(sprites).map(writeSprite))

      // Rest of the code is only for development
      if (!nuxt.options.dev) {
        return
      }

      const handleFileChange = async (event: string, file: string) => {
        if (!file.startsWith(input)) {
          return
        }

        file = file.substring(input.length + 1)
        const { name, sprite } = useSvgFile(file, { defaultSprite: options.defaultSprite })

        if (event === 'update') {
          logger.log(`${file} changed`)
          await addSvg({
            name,
            sprite,
            content: await nitro.storage.getItem(`${input}:${file}`) as string
          })
        } else if (event === 'remove') {
          logger.log(`${file} removed`)
          removeSvg(sprite, name)
        }
        await writeSprite(sprite)

        await updateTemplates({
          filter: template => template.filename?.startsWith('svg-sprite')
        })
      }
      nitro.storage.watch((event, file) => handleFileChange(event, file))
    })
  }
})
