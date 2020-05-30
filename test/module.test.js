const { Nuxt } = require('nuxt')
const config = require('../demo/nuxt.config')
const url = path => `http://localhost:3000${path}`

let nuxt
beforeAll(async () => {
  nuxt = new Nuxt(config)
  await nuxt.listen(3000)
}, 60000)

afterAll(async () => {
  await nuxt.close()
})

describe('Render module', () => {
  beforeEach(async () => {
    await page.goto(url('/'))
  })
  let hrefs = []

  test('all svg files sould be exist', async () => {
    hrefs = await page.evaluate(() => {
      const elements = document.querySelectorAll('use')
      return Array.from(elements).map(el => el.getAttribute('xlink:href'))
    })
    const paths = hrefs.map(path => path.split('#')[0])
    const sprites = Array.from(new Set(paths))

    for (const sprite of sprites) {
      const request = await page.goto(url(sprite))
      expect(request.status()).toEqual(200)
    }
  })

  test('all icon should be rendered and have width/height greater than zero', async () => {
    for (const href of hrefs) {
      const box = await page.evaluate((href) => {
        const elements = Array.from(document.querySelectorAll(`use`))
          .filter(el => el.getAttribute('xlink:href') === href)
        if (elements.length === 0) {
          return null
        }
        const bbox = elements[0].getBBox()
        return {
          width: bbox.width,
          height: bbox.height
        }
      }, href)
      expect(typeof box).toEqual('object')
      expect(box.width).toBeGreaterThan(0)
      expect(box.height).toBeGreaterThan(0)
    }
  })
})

describe('Inline Definitions', () => {
  beforeEach(async () => {
    await page.goto(url('/empty-defs'))
  })

  test('<defs> should not have any content', async () => {
    const spritePath = await page.evaluate(() => {
      const element = document.querySelector('.add-icon use')
      return element.getAttribute('xlink:href')
    })

    await page.goto(url(spritePath))

    const content = await page.content()

    expect(content).toMatch(/<defs>[^\w0-9]*<\/defs>/)
  })
})
