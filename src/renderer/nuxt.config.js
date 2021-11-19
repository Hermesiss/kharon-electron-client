/**
 * By default, Nuxt.js is configured to cover most use cases.
 * This default configuration can be overwritten in this file
 * @link {https://nuxtjs.org/guide/configuration/}
 */

require('dotenv').config()

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
    title: 'Kharon launcher',
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
    '@nuxtjs/auth-next',
    '@nuxtjs/i18n',
  ],
  i18n: {
    locales: [
      {code: 'en', iso: 'en-US', file: 'en.json', name: 'English'},
      {code: 'ru', iso: 'ru-RU', file: 'ru.json', name: 'Русский'}
    ],
    langDir: 'languages/',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      alwaysRedirect: false,
      fallbackLocale: 'en',
      redirectOn: 'all',
    },
    vuex: {moduleName: 'i18n', syncRouteParams: true},
    strategy: 'no_prefix'
  },
  axios: {
    baseURL: process.env.NODE_ENV === 'development'
      ? process.env.DEBUG_URL
      : process.env.RELEASE_URL
  },
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
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
