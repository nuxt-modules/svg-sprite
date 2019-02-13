import { sep, join } from 'path'
import fs from 'fs-extra'
import consola from 'consola'
import chalk from 'chalk'

import {
  writeSVG,
  readSVG,
  optimizeSVG,
  convertToSymbol,
  isSVGFile,
  wrap,
  extractDefs
} from './svg'

const logger = consola.withScope('@nuxtjs/svg-sprite')
const sprites = {}

export function generateName(name) {
  return name
    .toLowerCase()
    .replace(/\.svg$/, '')
    .replace(/[^a-z0-9-]/g, '-')
}

function registerSymbol(sprite, symbol) {
  sprites[sprite].symbols[symbol.name] = symbol
}

async function newIcon(file, sprite, name) {
  const rawContent = await readSVG(file)
  const optimizeContent = await optimizeSVG(name, rawContent)
  const symbol = await convertToSymbol(name, optimizeContent)
  const defs = await extractDefs(optimizeContent)

  await registerSymbol(sprite, {
    name,
    path: file,
    content: symbol,
    defs
  })
}

async function createSprite(name, source) {
  const files = await fs.readdir(source)

  if (!sprites[name]) {
    sprites[name] = {
      name,
      symbols: {}
    }
  }
  for (const file of files) {
    const path = join(source, file)
    const iconName = generateName(file)

    if (isSVGFile(file) && !sprites[name].symbols[iconName]) {
      await newIcon(path, name, iconName)
    }
  }
}

async function writeSprites(directory) {
  for (const name in sprites) {
    await writeSprite(name, directory)
  }
}

async function writeSprite(name, directory) {
  if (!sprites[name]) {
    return
  }

  const symbols = Object.values(sprites[name].symbols)
    .map(s => s.content)
    .join('\n')

  const defs = Object.values(sprites[name].symbols)
    .map(s => s.defs)
    .filter(d => Boolean(d))
    .join('\n')

  const svg = wrap(symbols, defs)

  await writeSVG(
    join(directory, `${name}.svg`),
    svg
  )
}

export async function addIcon(file, { input, output, defaultSprite }) {
  const path = file.replace(input + sep, '')
  const arr = path.split(sep)
  const sprite = arr.length === 2 ? arr[0] : defaultSprite
  const iconName = generateName(arr[arr.length - 1])

  if (!sprites[sprite]) {
    sprites[sprite] = {
      name: sprite,
      symbols: {}
    }
  }

  await newIcon(file, sprite, iconName)

  await writeSprite(sprite, output)
  logger.log({
    type: 'added',
    message: `SVG icon ${chalk.bold(sprite + '/' + iconName)} added`,
    icon: chalk.green.bold('+')
  })
}

export async function invalidateIcon(file, { input, output, defaultSprite }) {
  const path = file.replace(input + sep, '')
  const arr = path.split(sep)
  const sprite = arr.length === 2 ? arr[0] : defaultSprite
  const iconName = generateName(arr[arr.length - 1])

  delete sprites[sprite].symbols[iconName]

  const spriteFile = join(output, sprite + '.svg')
  if (await fs.exists(spriteFile)) {
    await fs.unlink(spriteFile)
  }

  await writeSprite(sprite, output)
  logger.log({
    type: 'removed',
    message: `SVG icon ${chalk.bold(sprite + '/' + iconName)} removed`,
    icon: chalk.red.bold('-')
  })
}

export async function invalidateSprite(file, { input, output }) {
  const arr = file.replace(input + sep, '').split(sep)
  const sprite = arr[arr.length - 1]

  delete sprites[sprite]

  const spriteFile = join(output, sprite + '.svg')
  if (await fs.exists(spriteFile)) {
    await fs.unlink(spriteFile)
  }
}

export async function generateSprite({ input, output, defaultSprite }) {
  const files = await fs.readdir(input)
  let hasDefaultSprite = false

  for (const file of files) {
    const source = join(input, file)
    if (isSVGFile(file)) {
      hasDefaultSprite = true
    }
    const stat = await fs.lstat(source)
    if (stat.isDirectory()) {
      await createSprite(file, source)
    }
  }

  if (hasDefaultSprite) {
    await createSprite(defaultSprite, input)
  }

  await writeSprites(output)
}
