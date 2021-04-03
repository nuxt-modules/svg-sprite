import path, { join } from 'path'
import { mkdirp, writeFile } from 'fs-extra'
import Svg from './svg'
import { pkg } from './utils'
import Watcher from './watcher'

const DEFAULTS = {
  input: '~/assets/sprite/svg',
  output: '~/assets/sprite/gen',
  defaultSprite: 'icons',
  svgoConfig: null,
  elementClass: 'icon',
  spriteClassPrefix: 'sprite-',
  publicPath: null,
  outputPath: null,
  iconsPath: '/_icons'
}

let svgManager

async function SVGSpriteModule (moduleOptions) {
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
    src: path.resolve(__dirname, 'runtime/plugin.js'),
    fileName: 'nuxt-svg-sprite.js',
    options
  })

  if (this.nuxt.options.dev && options.iconsPath) {
    // add layout
    const layout = path.resolve(__dirname, 'runtime', 'layouts', 'svg-sprite.vue')
    this.addLayout(layout, 'svg-sprite')

    // register page
    const componentPath = path.resolve(__dirname, 'runtime', 'components', 'icons-list.vue')
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

  svgManager = new Svg(options)
  svgManager.hook('svg-sprite:update', (sprites) => {
    options.sprites = Object.keys(sprites)
  })

  if (nuxt.options.dev) {
    nuxt.options.build.watch.push(
      path.resolve(join(options.output, 'sprites.json'))
    )
    nuxt.hook('build:done', () => {
      options._filesWatcher = new Watcher(svgManager)
    })

    nuxt.hook('close', () => {
      if (options._filesWatcher) {
        options._filesWatcher.close()
      }
    })
  }

  await init(options)

  await svgManager.generateSprites()

  this.nuxt.hook('storybook:config', ({ stories }) => {
    stories.push('@nuxtjs/svg-sprite/dist/runtime/stories/*.stories.js')
  })

  // alias output dir
  nuxt.options.alias['~svgsprite'] = options.output
  // Transpile and alias runtime
  const runtimeDir = path.resolve(__dirname, 'runtime')
  nuxt.options.alias['~svg-sprite-runtime'] = runtimeDir
}

async function init (options) {
  // Create input/output folder
  await mkdirp(options.input)
  await mkdirp(options.output)

  // Ignore output folder contents
  await writeFile(path.join(options.output, '.gitignore'), '*')
}

function extendBuild (config, options) {
  // exclude sprite output folder from all the svg loaders
  config.module.rules.forEach((rule) => {
    if (String(rule.test).includes('svg')) {
      if (!rule.exclude) { rule.exclude = [] }

      rule.exclude.push(path.resolve(options.output))
    }
  })

  const fileLoaderOptions: any = {}
  if (options.publicPath) {
    fileLoaderOptions.publicPath = options.publicPath
  }
  if (options.outputPath) {
    fileLoaderOptions.outputPath = options.outputPath
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

(SVGSpriteModule as any).meta = pkg

export default SVGSpriteModule
