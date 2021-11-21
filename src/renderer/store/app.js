import {app} from 'electron'

export const state = () => ({
  apps: [],
  selectedApp: null
})

export const mutations = {
  setApps(state, apps) {
    state.apps = apps
  },
  setSelectedApp(state, selectedApp) {
    state.selectedApp = selectedApp
  }
}

export const getters = {
  getAppById: state => id => {
    return state.apps.find(c => c.id === id)
  },
}

export const actions = {
  async fetchApps(state, apps) {
    console.log(apps)
    if (!apps) {
      console.log(state)
      const c = state.rootGetters['company/getSelectedCompany']
      console.log('SELECTED COMPANY', c)
      apps = c?.apps
      console.log(apps)
    }
    const appArr = []
    state.commit('setApps', [])
    for (const appsKey of apps) {
      const appInfo = await state.dispatch('getApp', appsKey)
      appArr.push(appInfo)
    }

    state.commit('setApps', appArr)
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
