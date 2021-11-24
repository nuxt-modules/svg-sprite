import { setupTest, createPage, url } from '@nuxt/test-utils'

describe('Render module', () => {
  setupTest({
    fixture: '../examples/v2',
    configFile: 'nuxt.config.ts',
    server: true,
    browser: true
  })
  let page
  let hrefs = []

  test('all svg files sould be exist', async () => {
    page = await createPage()
    await page.goto(url('/'))
    hrefs = await page.evaluate(() => {
      const elements = document.querySelectorAll('use')
      return Array.from(elements).map(el => el.getAttribute('href'))
    })
    const paths = hrefs.map(path => path.split('#')[0])
    const sprites = Array.from(new Set(paths))

    for (const sprite of sprites) {
      const request = await page.goto(url(sprite))
      expect(request.status()).toEqual(200)
    }
  })

  test('all icon should be rendered and have width/height greater than zero', async () => {
    await page.goto(url('/'))
    for (const href of hrefs) {
      const box = await page.evaluate((href) => {
        const elements = Array.from(document.querySelectorAll('use'))
          .filter(el => el.getAttribute('href') === href)
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

  test('<defs> should not have any content', async () => {
    await page.goto(url('/empty-defs'))
    const spritePath = await page.evaluate(() => {
      const element = document.querySelector('.add-icon use')
      return element.getAttribute('href')
    })

    await page.goto(url(spritePath))

    const content = await page.content()

    expect(content).toMatch(/<defs>[^\w0-9]*<\/defs>/)
  })
})