<template>
  <div>
    <div>
      <svg-icon name="nuxtjs" title="Nuxt.js" :desc="aboutNuxt" width="150px" height="150px" />
    </div>
    <div>
      <svg-icon name="dreams/zantagle-moon" title="Zantagle Moon" width="150px" height="150px" />
      <svg-icon name="dreams/Nursery_Unicorn_7946" title="Nursery Unicorn" width="150px" height="150px" />
      <svg-icon name="dreams/Beautiful_Little_Girl_7881" title="Beautiful Little Girl" width="150px" height="150px" />
    </div>
    <div>
      <svg-icon name="love/Bee Mine" title="Bee Mine" width="150px" height="150px" />
      <svg-icon name="love/Hugs And Kisses" title="Hugs And Kisses" width="150px" height="150px" />
      <svg-icon name="love/Love" title="Love" width="150px" height="150px" />
    </div>
    <div class="copyright">
      photos by <a href="https://lovesvg.com" rel="noopener">
        lovesvg
      </a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      aboutNuxt: 'Nuxt.js presets all the configuration needed to make your development of a Vue.js application enjoyable.'
    }
  }
}
</script>

<style>
body {
    text-align: center;
}
.copyright {
    margin-top: 25px;
}
</style>
