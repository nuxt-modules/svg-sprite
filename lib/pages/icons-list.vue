<template>
  <div class="container">
    <div
      v-for="sprite in sprites"
      :key="sprite.name"
    >
      <h2>{{ sprite.name }}</h2>
      <div class="content">
        <div
          v-for="symbol in sprite.symbols"
          :key="symbol"
          class="icon-box"
        >
          <div class="icon-svg">
            <svg-icon
              :name="symbol.path"
              :title="symbol.path"
              class="icon"
              width="30px"
              height="30px"
            />
          </div>
          <code class="name">
            {{ symbol.name }}
          </code>
          <input
            class="name"
            type="text"
            readonly
            :value="symbol.path"
            @click="copy"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sprites from '<%= options._output %>/sprites.json'

export default {
  data () {
    const defaultSprite = '<%= options.defaultSprite %>'
    return {
      defaultSprite,
      sprites: sprites.map((sprite) => {
        const namespace = sprite.name !== defaultSprite ? `${sprite.name}/` : ''
        return {
          name: sprite.name,
          symbols: sprite.symbols.map(symbol => ({
            name: symbol,
            path: `${namespace}${symbol}`
          }))
        }
      })
    }
  },
  methods: {
    copy (e) {
      const el = e.target
      el.select()
      el.setSelectionRange(0, 99999)
      document.execCommand('copy')
    }
  },
  head () {
    return {
      title: 'Icons list - nuxt-svg-sprite'
    }
  }
}
</script>

<style scoped>
.container {
    width: 1024px;
    margin: 0 auto;
}
.icon-box {
    padding: 0 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 80px;
    width: 120px;
}
.icon-box-svg {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}
.content {
    display: flex;
    flex-wrap: wrap;
}
.name {
    font-size: 0.7rem;
    width: 100%;
    height: 1.5em;
    overflow: hidden;
    white-space: nowrap;
    background: #f8f8f8;
    direction: ltr;
    text-align: center;
    border: none;
    margin-top: 10px;
}
input.name {
    margin-top: -20px;
    opacity: 0;
    cursor: copy;
}
h2 {
    margin-top: 3em;
}
.header {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
</style>
