import semver from 'semver'
import {ipcRenderer} from 'electron'
import {UpdateState} from '~/plugins/types'

require('dotenv').config()

let isInitialized = false

export const state = () => ({
  installedVersion: '0.0.1',
  availableVersion: '0.0.1',
  downloadedVersion: '0.0.1',
  downloadSize: 0,
  downloadProgress: 0,
  isFetching: false,
  isDownloading: false,
  /**
   *
   * @typedef {object} AppToInstall
   * @property {KharonApp | null} app
   * @property {String | null} version
   */

  /** @type {AppToInstall}  */
  appToInstall: {app: null, version: null},
  /**
   * @typedef {Object} AppToDelete
   * @property {KharonApp | null} app
   */

  /**
   * @type {AppToDelete} app
   */
  appToDelete: {app: null}
})

export const mutations = {
  /**
   *
   * @param state
   * @param {String} version
   */
  setAvailableVersion(state, version) {
    version = semver.clean(version)
    state.availableVersion = version
  },
  /**
   *
   * @param state
   * @param {String} version
   */
  setInstalledVersion(state, version) {
    version = semver.clean(version)
    state.installedVersion = version
  },
  /**
   *
   * @param state
   * @param {Number} size
   */
  setDownloadSize(state, size) {
    state.downloadSize = size
  },
  setDownloadedVersionAsAvailable(state) {
    state.downloadedVersion = state.availableVersion
  },
  /**
   *
   * @param state
   * @param {Boolean} mode
   */
  setFetching(state, mode) {
    state.isFetching = mode
  },
  /**
   *
   * @param state
   * @param {Boolean} mode
   */
  setDownloading(state, mode) {
    state.isDownloading = mode
  },
  /**
   *
   * @param state
   * @param {Number} progress
   */
  setDownloadProgress(state, progress) {
    state.downloadProgress = progress
  },
  /**
   *
   * @param state
   * @param {KharonApp | null} app
   * @param {String | null} version
   */
  setAppToInstall(state, {app, version}) {
    state.appToInstall = {app, version}
  },
  /**
   *
   * @param state
   * @param {KharonApp | null} app
   */
  setAppToDelete(state, app) {
    state.appToDelete = {app}
  }
}

export const actions = {
  async initStore(context) {
    if (!isInitialized) {
      isInitialized = true
      ipcRenderer.on('downloadProgress',
        (_, progress) => context.commit('setDownloadProgress', progress))
      ipcRenderer.on('downloadState', (_, state) => {
        if (state) {
          context.commit('setDownloadedVersionAsAvailable')
        }
        context.commit('setDownloading', state)
      })

      await context.dispatch('checkUpdate')

      setInterval(() => context.dispatch('checkUpdate'), 300 * 1000)
    }
  },
  async checkUpdate(context) {
    const currentState = context.getters.currentUpdateState
    if (currentState !== UpdateState.Actual) return

    context.commit('setFetching', true)
    const result = await ipcRenderer.invoke('check-update', '')
    context.commit('setAvailableVersion', result.updateInfo.version)
    context.commit('setDownloadSize', result.updateInfo.files.reduce((a, x) => a + x.size, 0))
    context.commit('setFetching', false)
  },
  async downloadUpdate(context) {
    context.commit('setDownloadProgress', 0)
    context.commit('setDownloading', true)
    await ipcRenderer.invoke('download-update', '')
    context.commit('setDownloading', false)
  },
  async installUpdate() {
    await ipcRenderer.invoke('install-update', '')
  },
  async getInstalledVersion(context) {
    const version = process.env.NODE_ENV === 'development' ? '0.0.1' : await ipcRenderer.invoke('get-version')
    context.commit('setInstalledVersion', version)
    return version
  }
}

export const getters = {
  /**
   *
   * @param state
   * @return {boolean}
   */
  isActual: state => {
    return semver.gte(state.installedVersion, state.availableVersion)
  },
  /**
   *
   * @param state
   * @return {boolean}
   */
  isPending: state => {
    return semver.lt(state.installedVersion, state.downloadedVersion) &&
      semver.gte(state.downloadedVersion, state.availableVersion)
  },
  /**
   *
   * @param state
   * @param getters
   * @return {UpdateState}
   */
  currentUpdateState: (state, getters) => {
    if (state.isFetching) return UpdateState.Fetching
    if (state.isDownloading) return UpdateState.Downloading
    if (getters.isPending) return UpdateState.CanInstall
    if (!getters.isActual) {
      return UpdateState.NewAvailable
    }
    return UpdateState.Actual
  },
  /**
   *
   * @param state
   * @return {number}
   */
  downloadedBytes: state => {
    const bytes = parseFloat(state.downloadSize / (100 - state.downloadProgress))
    if (isFinite(bytes)) return bytes
    return 0
  }
}
