import path from 'path';

export default {
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  },

  modules: [
      ['../lib/module.js']
  ],



  srcDir: path.resolve(__dirname),
  rootDir: path.resolve(__dirname, '..'),
};
