import ElectronStore from 'electron-store'
import {ipcRenderer} from "electron";

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
  appConfigs: {},
  lastAppCount: 3,
  isFetching: false
})

export const mutations = {
  setApps(state, apps) {
    console.log('SET APPS')
    state.apps = apps
  },
  setSelectedApp(state, selectedApp) {
    state.selectedApp = selectedApp
  },
  addConfig(state, appCode) {
    // noinspection JSCheckFunctionSignatures
    state.appConfigs[appCode] = new ElectronStore({name: `config-app-${appCode}`, schema: appConfigSchema})
  },
  setFetching(state, fetching) {
    state.isFetching = fetching
  },
  setLastAppCount(state, lastAppCount) {
    state.lastAppCount = lastAppCount
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
    context.commit('setFetching', true)
    context.commit('setLastAppCount', apps.length)

    const selected = context.state.selectedApp?.id

    const appArr = []

    const configs = context.state.appConfigs
    for (const appsKey of apps) {
      const appInfo = await context.dispatch('getApp', appsKey)
      appArr.push(appInfo)
      if (selected && selected === appsKey) {
        context.commit('setSelectedApp', appInfo)
      }
      if (!configs[appInfo.appCode]) {
        context.commit('addConfig', appInfo.appCode)
      }
    }
    context.commit('setApps', appArr)
    context.commit('setFetching', false)
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
  async addVersion(state, {appId, version, changes}) {
    const resp = await this.$axios.$post(`/apps/${appId}/version`, {version, changes})
    return resp.date
  },
  async updateVersion(state, {appId, version, changes}) {
    const resp = await this.$axios.$put(`/apps/${appId}/version`, {version, changes})
    return resp.date
  },
  async deleteVersion(state, {appId, version}) {
    const resp = await this.$axios.$delete(`/apps/${appId}/version/${version}`)
    return resp.date
  },
  async downloadManifest(state, {app, versionCode}) {
    const baseUrl = `${app.rootPath}/${app.appCode}/${versionCode}`
    const manifestUrl = `${baseUrl}/manifest.json`
    return await this.$axios.$get(manifestUrl)
  },
  async diffManifests(state, {oldManifest, newManifest}) {
    return await ipcRenderer.invoke('manifest-diff', oldManifest, newManifest)
  }
}
