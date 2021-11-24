import { sep } from 'path'
import { watch } from 'chokidar'
import chalk from 'chalk'
import { generateName, logger } from './utils'

export default class Watcher {
  constructor (svgManager) {
    const filesWatcher = watch(svgManager.input, {
      ignoreInitial: true
    })

    if (filesWatcher) {
      logger.info(`Watching ${svgManager._input} for new icons`)

      // Watch for new icons
      filesWatcher.on('add', file => this.onFileAdded(file))

      // Keep eye on current icons
      filesWatcher.on('change', file => this.onFileAdded(file))

      // Pray for lost icon
      filesWatcher.on('unlink', file => this.onFileRemoved(file))

      // Pray for lost directory
      filesWatcher.on('unlinkDir', file => this.onDirectoryRemoved(file))
    }

    this.svgManager = svgManager
    this._filesWatcher = filesWatcher
  }

  close () {
    this._filesWatcher.close()
    delete this._filesWatcher
  }

  onFileAdded (file) {
    const path = file.replace(this.svgManager.input + sep, '')
    const arr = path.split(sep)
    const sprite = arr.length === 2 ? arr[0] : ''
    const iconName = generateName(arr[arr.length - 1])

    this.svgManager.newSymbol(file, iconName, sprite)

    logger.log({
      type: 'added',
      message: `SVG icon ${chalk.bold(sprite + '/' + iconName)} added`,
      icon: chalk.green.bold('+')
    })
  }

  onFileRemoved (file) {
    const path = file.replace(this.svgManager.input + sep, '')
    const arr = path.split(sep)
    const sprite = arr.length === 2 ? arr[0] : ''
    const iconName = generateName(arr[arr.length - 1])

    this.svgManager.unregisterSymbol(iconName, sprite)

    logger.log({
      type: 'removed',
      message: `SVG icon ${chalk.bold(sprite + '/' + iconName)} removed`,
      icon: chalk.red.bold('-')
    })
  }

  onDirectoryRemoved (file) {
    const sprite = file.split(sep).pop()

    this.svgManager.unregisterSprite(sprite)
  }
}
