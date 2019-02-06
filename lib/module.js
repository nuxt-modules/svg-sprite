
import { generateSprite, invalidateIcon, invalidateSprite, addIcon } from './utils';
import path from 'path'
import consola from 'consola'
import { mkdirp, writeFile } from 'fs-extra'
import chokidar from 'chokidar'

const logger = consola.withScope('@nuxtjs/svg-sprite')
const DEFAULTS = {
  input: '~/assets/sprite/svg',
  output: '~/assets/sprite/gen',
  defaultSprite: 'icons'
}

export default async function module (moduleOptions) {
    const options = {...DEFAULTS, ...moduleOptions, ...this.options.svgSprite}
    const resolve = path => path.replace('~', this.nuxt.options.srcDir);

    options._input = options.input
    options.input = resolve(options.input);
    options.output = resolve(options.output);

    await init.call(this, options);

    await setupHooks.call(this, options);

    await generateSprite(options);

    // Register plugin
    this.addPlugin({
      src: path.resolve(__dirname, 'plugin.js'),
      fileName: 'nuxt-svg-sprite.js',
      options
    })
}

function watchFiles(options) {
  const filesWatcher = options._filesWatcher = chokidar.watch(options.input, {
    ignoreInitial: true,
  })

  if (filesWatcher) {
    logger.info(`Watching ${options._input} for new icons`)

    // Watch for new icons
    filesWatcher.on('add', async (file) => addIcon(file, options))

    // Keep eye on current icons
    filesWatcher.on('change', async (file) => addIcon(file, options))

    // Pray for lost icon
    filesWatcher.on('unlink', async (file) => invalidateIcon(file, options))

    // Pray for lost directory
    filesWatcher.on('unlinkDir', async (file) => invalidateSprite(file, options))
  }
}

async function init(options) {
  // Create input/output folder
  await mkdirp(options.input);
  await mkdirp(options.output);

  // Ignore output folder contents
  await writeFile(path.join(options.output, '.gitignore'), '*');
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
