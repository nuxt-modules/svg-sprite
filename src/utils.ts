import consola from 'consola'
import fs from 'fs-extra'
import { name, version } from '../package.json'

export const pkg = { name, version }

export const logger = consola.withScope('@nuxtjs/svg-sprite')

export function generateName (name) {
  return name
    .toLowerCase()
    .replace(/\.svg$/, '')
    .replace(/[^a-z0-9-]/g, '-')
}

export async function writeSVG (path, content) {
  const result = await fs.writeFile(path, content, { flag: 'w' })
  return result
}

export async function readSVG (path) {
  const result = await fs.readFile(path)
  return result
}

export function convertToSymbol (name, content) {
  const $data = content
    .replace('<svg', `<symbol id="i-${name}"`)
    .replace('</svg>', '</symbol>')
    .replace(/<defs>(.+)<\/defs>/, '')

  return $data
}

export function extractDefs (content) {
  const $data = content
    .match(/<defs>(.+)<\/defs>/)

  return $data ? $data[1] : ''
}

export function isSVGFile (file) {
  return file.match(/.*\.svg$/)
}

export function wrap (content, defs) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
    '<defs>\n' + defs + '\n</defs>\n' +
    content +
    '\n</svg>'
}
