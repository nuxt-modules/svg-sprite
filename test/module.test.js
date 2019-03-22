const { Nuxt } = require('nuxt-edge')
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

describe('Test module', () => {
  beforeEach(async () => {
    await page.goto(url('/'))
  })
  test('true', () => {
    expect(true).toEqual(true)
  })
})
