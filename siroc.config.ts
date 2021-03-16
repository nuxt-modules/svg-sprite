import { defineSirocConfig } from 'siroc'

export default defineSirocConfig({
  rollup: {
    externals: [
      'svgo/plugins/cleanupIDs',
      'svgo/plugins/removeAttrs',
      'svgo/plugins/removeDimensions',
      'svgo/plugins/removeViewBox',
      'svgo/plugins/inlineStyles'
    ]
  }
})
