import ElectronStore from 'electron-store'

const adminStoreSchema = {
  ftpAccounts: { default: {}},
  apps: { default: {}}
}

// noinspection JSCheckFunctionSignatures
const adminStore = new ElectronStore({name: 'admin', schema: adminStoreSchema})

export const state = () => ({
  apps: adminStore.get('apps'),
  ftpAccounts: adminStore.get('ftpAccounts')
})

export const mutations = {
  setApp(state, {appCode, app}) {
    console.log('SETTING SELECTED PATH TO', app, 'FOR APP', appCode)
    state.apps[appCode] = app
    adminStore.set('apps', state.apps)
  },

  setFtp(state, {host, ftp}) {
    state.ftpAccounts[host] = ftp
    adminStore.set('ftpAccounts', state.ftpAccounts)
  },

}

export const getters = {
  getApp: state => appCode => {
    return state.apps[appCode]
  },
  getFtp: state => host => {
    return state.ftpAccounts[host]
  }
}
