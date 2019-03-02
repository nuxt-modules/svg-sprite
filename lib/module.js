import path from 'path'
import consola from 'consola'
import { mkdirp, writeFile } from 'fs-extra'
import chokidar from 'chokidar'
import { generateSprite, invalidateIcon, invalidateSprite, addIcon } from './utils'

const logger = consola.withScope('@nuxtjs/svg-sprite')
const DEFAULTS = {
  input: '~/assets/sprite/svg',
  output: '~/assets/sprite/gen',
  defaultSprite: 'icons'
}

export default async function module(moduleOptions) {
  const options = { ...DEFAULTS, ...moduleOptions, ...this.options.svgSprite }
  const resolve = $path => $path
    .replace(/\//g, path.sep)
    .replace('~', this.nuxt.options.srcDir)

  this.extendBuild(extendBuild.bind(this))

  options._input = options.input
  options._output = options.output
  options.input = resolve(options.input)
  options.output = resolve(options.output)

  await init.call(this, options)

  await setupHooks.call(this, options)

  await generateSprite(options)

  // Register plugin
  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: 'nuxt-svg-sprite.js',
    options
  })
}

function watchFiles(options) {
  const filesWatcher = options._filesWatcher = chokidar.watch(options.input, {
    ignoreInitial: true
  })

  if (filesWatcher) {
    logger.info(`Watching ${options._input} for new icons`)

    // Watch for new icons
    filesWatcher.on('add', file => addIcon(file, options))

    // Keep eye on current icons
    filesWatcher.on('change', file => addIcon(file, options))

    // Pray for lost icon
    filesWatcher.on('unlink', file => invalidateIcon(file, options))

    // Pray for lost directory
    filesWatcher.on('unlinkDir', file => invalidateSprite(file, options))
  }
}

async function init(options) {
  // Create input/output folder
  await mkdirp(options.input)
  await mkdirp(options.output)

  // Ignore output folder contents
  await writeFile(path.join(options.output, '.gitignore'), '*')
}

function setupHooks(options) {
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

function extendBuild(config) {
  const urlLoader = config.module.rules.find(rule => String(rule.test).includes('svg'))
  urlLoader.test = /\.(png|jpe?g|gif)$/

  config.module.rules.push({
    test: /\.svg$/,
    use: [{
      loader: 'url-loader',
      options: {
        limit: 12
      }
    }]
  })
}
