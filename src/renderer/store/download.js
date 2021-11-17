import semver from 'semver'
import {app, remote} from 'electron'

console.log('GET VERSION INSIDE DOWNLOAD', app?.getVersion(), remote?.app?.getVersion())

export const state = () => ({
  installedVersion: localStorage.getItem('installedVersion'),
  availableVersion: '0.0.1', // localStorage.getItem('availableVersion'),
  downloadedVersion: localStorage.getItem('downloadedVersion'),
  downloadSize: 0
})

export const mutations = {
  increment(state) {
    state.counter++
  },
  setInstalledVersion(state, version) {
    version = semver.clean(version)
    localStorage.setItem('installedVersion', version)
    state.installedVersion = version
  },
  setAvailableVersion(state, version) {
    version = semver.clean(version)
    localStorage.setItem('availableVersion', version)
    state.availableVersion = version
  },
  setDownloadedVersion(state, version) {
    version = semver.clean(version)
    localStorage.setItem('downloadedVersion', version)
    state.downloadedVersion = version
  },
  setDownloadSize(state, size) {
    state.downloadSize = size
  },
  setDownloadedVersionAsAvailable(state) {
    state.downloadedVersion = state.availableVersion
  }
}

export const actions = {
  setInstalled({commit}, version) {
    commit('installedVersion', version)
  },
  setAvailable({commit}, version) {
    commit('installedVersion', version)
  },
  setDownloaded({commit}, version) {
    commit('installedVersion', version)
  },
}

export const getters = {
  isActual: state => {
    return semver.gte(state.installedVersion, state.availableVersion)
  },
  isPending: state => {
    return semver.lt(state.installedVersion, state.downloadedVersion) &&
      semver.gte(state.downloadedVersion, state.availableVersion)
  }
}
