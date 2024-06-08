import {ipcRenderer} from 'electron'

export const state = () => ({
  port: null
})

export const mutations = {
  setPort(state, port) {
    state.port = port
  }
}

export const actions = {
  initStore(context) {
    ipcRenderer.on('set-port', (_, port) => {
      context.commit('setPort', port)
    })
    ipcRenderer.on('register-computer', async () => {
      await context.dispatch('settings/registerComputer', null, {root: true})
    })
    ipcRenderer.on('launch-app', async (_, appCode) => {
      const app = await context.dispatch('app/getAppByCode', appCode, {root: true})
      await context.dispatch('app/launchApp', app, {root: true})
      ipcRenderer.send('launch-app-return', true)
    })
    ipcRenderer.on('get-app-list', async () => {
      const apps = await context.dispatch('app/fetchApps', null, {root: true})
      const installed = context.rootState.app.installedApps
      const appConfigs = context.rootState.app.appConfigs
      const configs = []
      for (const appCode of installed) {
        if (!appConfigs[appCode]) {
          await context.commit('app/addConfig', appCode, {root: true})
        }
        const config = {
          appCode,
          installed: appConfigs[appCode].get('installed'),
          version: appConfigs[appCode].get('version'),
          id: appConfigs[appCode].get('id')
        }
        configs.push(config)
      }
      ipcRenderer.send('get-app-list-return', {
        configs
      })
    })
  }
}
