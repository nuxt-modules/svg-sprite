import fsp from 'fs/promises'
import { getQuery, eventHandler } from 'h3'
import { joinURL } from 'ufo'
import { useRuntimeConfig } from '#imports'

export default eventHandler(async (event) => {
  const { collection, sprite, icon } = getQuery(event)
  const { inputDir, defaultSprite } = useRuntimeConfig().svgSprite
  const _sprite = sprite === defaultSprite ? '' : sprite as string

  const file = joinURL(inputDir, _sprite, `${collection}--${icon}.svg`)
  const exists = await fsp.access(file, fsp.constants.F_OK).then(() => true).catch(() => false)

  if (exists) {
    return 200
  }
  try {
    const data = await $fetch<any>(`https://api.iconify.design/${collection}.json?icons=${icon}`)
    const fetchedIcon = data.icons[icon as string]
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${data.width}" height="${data.height}" viewBox="0 0 ${fetchedIcon.width || data.width} ${fetchedIcon.height || data.height}">\n${fetchedIcon.body}\n</svg>`

    await fsp.mkdir(joinURL(inputDir, _sprite), { recursive: true })
    await fsp.writeFile(file, svg)
  } catch (e) {
    return 500
  }
  return 200
})
