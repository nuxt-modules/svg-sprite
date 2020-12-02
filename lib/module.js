import path from 'path'
import consola from 'consola'
import { mkdirp, writeFile } from 'fs-extra'
import chokidar from 'chokidar'
import { generateSprite, invalidateIcon, invalidateSprite, addIcon } from './utils'
import Svg from './svg'

const logger = consola.withScope('@nuxtjs/svg-sprite')
const DEFAULTS = {
  input: '~/assets/sprite/svg',
  output: '~/assets/sprite/gen',
  defaultSprite: 'icons',
  svgoConfig: null,
  elementClass: 'icon',
  spriteClassPrefix: 'sprite-',
  publicPath: null,
  iconsPath: '/_icons'
}

let svgManager

export default async function module (moduleOptions) {
  const { nuxt } = this
  const options = {
    ...DEFAULTS,
    ...moduleOptions,
    ...this.options.svgSprite
  }

  const resolve = $path => $path
    .replace(/\//g, path.sep)
    .replace('~', this.nuxt.options.srcDir)

  this.extendBuild(config => extendBuild.call(this, config, options))

  options._input = options.input
  options._output = options.output
  options.input = resolve(options.input)
  options.output = resolve(options.output)

  // Register plugin
  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: 'nuxt-svg-sprite.js',
    options
  })

  if (this.nuxt.options.dev && options.iconsPath) {
    // add layout
    const layout = path.resolve(__dirname, 'layouts', 'svg-sprite.vue')
    this.addLayout(layout, 'svg-sprite')

    // register page
    const componentPath = path.resolve(__dirname, 'pages', 'icons-list.vue')
    this.extendRoutes(function svgModuleExtendRoutes (routes) {
      routes.unshift({
        name: 'icons-list',
        path: options.iconsPath,
        component: componentPath
      })
    })
  }

  /**
   * There is no need to register hooks and create SVGO instance in
   * start-mode
   */
  if (this.nuxt.options._start) {
    return
  }

  const config = typeof options.svgoConfig === 'function'
    ? options.svgoConfig()
    : options.svgoConfig
  svgManager = new Svg(config)

  await setupHooks.call(this, options)

  this.nuxt.hook('storybook:config', ({ stories }) => {
    stories.push('@nuxtjs/svg-sprite/stories/*.stories.js')
  })

  // alias output dir
  nuxt.options.alias['~svgsprite'] = options.output
}

function watchFiles (options) {
  const filesWatcher = options._filesWatcher = chokidar.watch(options.input, {
    ignoreInitial: true
  })

  if (filesWatcher) {
    logger.info(`Watching ${options._input} for new icons`)

    // Watch for new icons
    filesWatcher.on('add', file => addIcon(svgManager, file, options))

    // Keep eye on current icons
    filesWatcher.on('change', file => addIcon(svgManager, file, options))

    // Pray for lost icon
    filesWatcher.on('unlink', file => invalidateIcon(svgManager, file, options))

    // Pray for lost directory
    filesWatcher.on('unlinkDir', file => invalidateSprite(svgManager, file, options))
  }
}

async function init (options) {
  // Create input/output folder
  await mkdirp(options.input)
  await mkdirp(options.output)

  // Ignore output folder contents
  await writeFile(path.join(options.output, '.gitignore'), '*')
}

function setupHooks (options) {
  this.nuxt.hook('build:before', async () => {
    await init.call(this, options)

    await generateSprite(svgManager, options)
  })

  this.nuxt.hook('build:done', () => {
    if (this.nuxt.options.dev) {
      watchFiles.call(this, options)
    }
  })

  this.nuxt.hook('close', () => {
    if (options._filesWatcher) {
      options._filesWatcher.close()
      delete options._filesWatcher
    }
  })
}

function extendBuild (config, options) {
  // exclude sprite output folder from all the svg loaders
  config.module.rules.forEach((rule) => {
    if (String(rule.test).includes('svg')) {
      if (!rule.exclude) { rule.exclude = [] }

      rule.exclude.push(path.resolve(options.output))
    }
  })

  const fileLoaderOptions = {}
  if (options.publicPath) {
    fileLoaderOptions.publicPath = options.publicPath
  }

  // add file-loader only to sprite output folder
  config.module.rules.push({
    test: /\.svg$/,
    include: [path.resolve(options.output)],
    use: [
      {
        loader: 'file-loader',
        options: fileLoaderOptions
      }
    ]
  })
}
