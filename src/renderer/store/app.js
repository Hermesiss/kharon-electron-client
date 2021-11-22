import ElectronStore from 'electron-store'

const mainStoreSchema = {
  apps: {type: 'array', default: []}
}

const appConfigSchema = {
  installed: {type: 'boolean', default: false},
  installedPath: {type: 'string', default: ''},
  settings: {type: 'array', default: []}
}

// noinspection JSCheckFunctionSignatures
const mainStore = new ElectronStore({name: 'config-apps', schema: mainStoreSchema})

export const state = () => ({
  apps: [],
  selectedApp: null,
  installedApps: mainStore.get('apps'),
  appConfigs: {}
})

export const mutations = {
  setApps(state, apps) {
    state.apps = apps
  },
  setSelectedApp(state, selectedApp) {
    state.selectedApp = selectedApp
  },
  addConfig(state, appCode) {
    // noinspection JSCheckFunctionSignatures
    state.appConfigs[appCode] = new ElectronStore({name: `config-app-${appCode}`, schema: appConfigSchema})
  }
}

export const getters = {
  getAppById: state => id => {
    return state.apps.find(c => c.id === id)
  },
}

export const actions = {
  async fetchApps(context, apps) {
    if (!apps) {
      const c = context.rootGetters['company/getSelectedCompany']
      apps = c?.apps
    }
    const appArr = []
    context.commit('setApps', [])
    const configs = context.state.appConfigs
    for (const appsKey of apps) {
      const appInfo = await context.dispatch('getApp', appsKey)
      appArr.push(appInfo)
      if (!configs[appInfo.appCode]) {
        context.commit('addConfig', appInfo.appCode)
      }
    }

    context.commit('setApps', appArr)
  },
  async getApp(state, id) {
    return await this.$axios.$get(`/apps/${id}`)
  },
  /* {
    "appName": String,
    "appCode": String,
    "rootPath": URL,
    "company" : String
} */
  async createApp(state, app) {
    const resp = await this.$axios.$post('/apps/create', app)
    return resp.data
  },
  /* {
        "appName": String,
        "appCode": String,
        "rootPath": URL,
        "company" : String
        "id": String
  } */
  async updateApp(state, app) {
    const resp = await this.$axios.$put(`/apps/${app.id}`, app)
    return resp.data
  },
  async deleteApp(state, appId) {
    const resp = await this.$axios.$delete(`/apps/${appId}`)
    return resp.data
  },
}
