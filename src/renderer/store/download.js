import semver from 'semver'
import {UpdateState} from '~/plugins/types'

export const state = () => ({
  installedVersion: '0.0.1', // localStorage.getItem('installedVersion'),
  availableVersion: '0.0.1', // localStorage.getItem('availableVersion'),
  downloadedVersion: localStorage.getItem('downloadedVersion') || '0.0.1',
  downloadSize: 0,
  downloadProgress: 0,
  isFetching: false,
  isDownloading: false
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
  },
  setFetching(state, mode) {
    state.isFetching = mode
  },
  setDownloading(state, mode) {
    state.isDownloading = mode
  },
  setDownloadProgress(state, progress) {
    state.downloadProgress = progress
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
  },
  currentUpdateState: (state, getters) => {
    if (state.isFetching) return UpdateState.Fetching
    if (state.isDownloading) return UpdateState.Downloading
    if (getters.isPending) return UpdateState.CanInstall
    if (!getters.isActual) {
      return UpdateState.NewAvailable
    }
    return UpdateState.Actual
  },
  downloadedBytes: state => {
    const bytes = parseFloat(state.downloadSize / (100 - state.downloadProgress))
    if (isFinite(bytes)) return bytes
    return 0
  }
}
