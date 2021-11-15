/**
 * By default, Nuxt.js is configured to cover most use cases.
 * This default configuration can be overwritten in this file
 * @link {https://nuxtjs.org/guide/configuration/}
 */

module.exports = {
  router: {middleware: ['auth']},
  auth: {
    strategies: {
      local: {
        token: {
          property: 'token',
          global: true,
          // required: true,
          // type: 'Bearer'
        },
        user: {
          property: false,
          autoFetch: true
        },
        endpoints: {
          login: {url: 'users/authenticate', method: 'post'},
          logout: false,
          user: {url: 'users/current', method: 'get'},
        }
      },
    }
  },
  ssr: false,
  target: 'static',
  head: {
    title: 'kharon-electron-client',
    meta: [{charset: 'utf-8'}]
  },
  loading: false,
  plugins: [
    {ssr: true, src: '@/plugins/icons.js'}
  ],
  buildModules: [
    '@nuxt/typescript-build',
  ],
  modules: [
    '@nuxtjs/vuetify',
    '@nuxtjs/axios',
    '@nuxtjs/auth-next'
  ],
  vuetify: {
    theme: {
      themes: {
        light: {
          primary: '#1867c0',
          secondary: '#b0bec5',
          accent: '#8c9eff',
          error: '#b71c1c'
        }
      }
    }
  }
}
