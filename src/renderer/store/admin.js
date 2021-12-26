import ElectronStore from 'electron-store'

const adminStoreSchema = {
  ftpAccounts: {default: {}},
  apps: {default: {}}
}

// noinspection JSCheckFunctionSignatures
const adminStore = new ElectronStore({name: 'admin', schema: adminStoreSchema})

/**
 * @typedef {Object} AdminApp
 * @property {String} selectedPath
 */

/**
 * @typedef {Object} AdminFtp
 * @property {String} username
 * @property {String} password
 */

export const state = () => ({
  /**
   * @type {Object<String, AdminApp>}
   */
  apps: adminStore.get('apps'),
  /**
   * @type {Object<String, AdminFtp>}
   */
  ftpAccounts: adminStore.get('ftpAccounts')
})

export const mutations = {
  /**
   *
   * @param state
   * @param {String} appCode
   * @param {AdminApp} app
   */
  setApp(state, {appCode, app}) {
    console.log('SETTING SELECTED PATH TO', app, 'FOR APP', appCode)
    state.apps[appCode] = app
    adminStore.set('apps', state.apps)
  },
  /**
   *
   * @param state
   * @param {String} host
   * @param {AdminFtp} ftp
   */
  setFtp(state, {host, ftp}) {
    state.ftpAccounts[host] = ftp
    adminStore.set('ftpAccounts', state.ftpAccounts)
  },

}

export const getters = {
  /**
   *
   * @param state
   * @return {function(String): AdminApp | undefined}
   */
  getApp: state => appCode => {
    return state.apps[appCode]
  },
  /**
   *
   * @param state
   * @return {function(String): AdminFtp | undefined}
   */
  getFtp: state => host => {
    return state.ftpAccounts[host]
  }
}
