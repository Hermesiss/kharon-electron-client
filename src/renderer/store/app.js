import ElectronStore from 'electron-store'
import {ipcRenderer} from 'electron'
/**
 * @typedef {object} KharonVersion
 * @property {string} version
 * @property {string} date
 * @property {string} _id
 * @property {string} changes
 */

/** @typedef {object} KharonApp
 * @property {boolean} published
 * @property {string} ftpHost
 * @property {string} ftpPath
 * @property {string} exePath
 * @property {string} exeParams
 * @property {Array<string>} ignoredFiles
 * @property {Array<string>} ignoredExtensions
 * @property {string} appCode
 * @property {string} appName
 * @property {string} company
 * @property {string} rootPath
 * @property {string} createdDate
 * @property {Array<KharonVersion>} versions
 * @property {string} id
 */

const mainStoreSchema = {
  apps: {type: 'array', default: []}
}

const appConfigSchema = {
  installed: {type: 'boolean', default: false},
  downloaded: {type: 'boolean', default: false},
  version: {type: 'string', default: '0.0.0'},
  installedPath: {type: 'string', default: ''},
  settings: {type: 'array', default: []}
}

// noinspection JSCheckFunctionSignatures
const mainStore = new ElectronStore({name: 'config-apps', schema: mainStoreSchema})

export const state = () => ({
  /** @type {KharonApp[]} */
  apps: [],
  /** @type {KharonApp | null} */
  selectedApp: null,
  installedApps: mainStore.get('apps'),
  /** @type {Object.<string, ElectronStore>} */
  appConfigs: {},
  lastAppCount: 3,
  isFetching: false
})

export const mutations = {
  /**
   *
   * @param state
   * @param {KharonApp[]}apps
   */
  setApps(state, apps) {
    console.log('SET APPS')
    state.apps = apps
  },
  /**
   *
   * @param state
   * @param {KharonApp} selectedApp
   */
  setSelectedApp(state, selectedApp) {
    state.selectedApp = selectedApp
  },
  /**
   *
   * @param state
   * @param {string} appCode
   */
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
  getAppConfig: state => appCode => {
    return state.appConfigs[appCode]
  }
}

export const actions = {
  /**
   *
   * @param context
   * @param {KharonApp} kharonApp
   * @return {Promise<void>}
   */
  async launchApp(context, kharonApp) {
    const appConfig = context.state.appConfigs[kharonApp.appCode]
    if (!appConfig || !appConfig.get('installedPath')) return

    await ipcRenderer.invoke('launch', kharonApp, appConfig.get('installedPath'),
      this.$i18n.t('dialog.deleteApp.error.title'),
      this.$i18n.t('dialog.deleteApp.error.text'))
  },
  /**
   *
   * @param context
   * @param {string[]} [apps]
   * @return {Promise<void>}
   */
  async fetchApps(context, apps) {
    if (!apps) {
      const c = context.rootGetters['company/getSelectedCompany']
      apps = c?.apps
    }
    context.commit('setFetching', true)
    context.commit('setLastAppCount', apps.length)

    const selected = context.state.selectedApp?.id

    /** @type {KharonApp[]} */
    const appArr = []

    const configs = context.state.appConfigs
    for (const appsKey of apps) {
      /** @type {KharonApp} */
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
  /**
   *
   * @param state
   * @param {string} id
   * @return {Promise<KharonApp>}
   */
  async getApp(state, id) {
    return await this.$axios.$get(`/apps/${id}`)
  },

  /**
   * @typedef {object} AppCreateDTO
   * @property {string} appName
   * @property {string} appCode
   * @property {string} rootPath
   * @property {string} company
   */

  /**
   *
   * @param state
   * @param {AppCreateDTO} app
   * @return {Promise<*>}
   */
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

  /**
   *
   * @typedef AppUpdateDTO
   * @property {string} appName
   * @property {string} appCode
   * @property {string} rootPath
   * @property {string} company
   * @property {string} id
   */

  /**
   *
   * @param state
   * @param {AppUpdateDTO} app
   * @return {Promise<*>}
   */
  async updateApp(state, app) {
    const resp = await this.$axios.$put(`/apps/${app.id}`, app)
    return resp.data
  },
  /**
   *
   * @param state
   * @param {string} appId
   * @return {Promise<*>}
   */
  async deleteApp(state, appId) {
    const resp = await this.$axios.$delete(`/apps/${appId}`)
    return resp.data
  },
  /**
   *
   * @param state
   * @param {string} appId
   * @param {string} version
   * @param {string} changes
   * @return {Promise<*>}
   */
  async addVersion(state, {appId, version, changes}) {
    const resp = await this.$axios.$post(`/apps/${appId}/version`, {version, changes})
    return resp.date
  },
  /**
   *
   * @param state
   * @param {string} appId
   * @param {string} version
   * @param {string} changes
   * @return {Promise<*>}
   */
  async updateVersion(state, {appId, version, changes}) {
    const resp = await this.$axios.$put(`/apps/${appId}/version`, {version, changes})
    return resp.date
  },
  /**
   *
   * @param state
   * @param {string} appId
   * @param {string} version
   * @return {Promise<*>}
   */
  async deleteVersion(state, {appId, version}) {
    const resp = await this.$axios.$delete(`/apps/${appId}/version/${version}`)
    return resp.date
  },
  /**
   *
   * @param state
   * @param {KharonApp} app
   * @param {string} versionCode
   * @return {Promise<any>}
   */
  async downloadManifest(state, {app, versionCode}) {
    const baseUrl = `${app.rootPath}/${app.appCode}/${versionCode}`
    const manifestUrl = `${baseUrl}/manifest.json`
    return await this.$axios.$get(manifestUrl)
  },
  async diffManifests(state, {oldManifest, newManifest}) {
    return await ipcRenderer.invoke('manifest-diff', oldManifest, newManifest)
  },
}
