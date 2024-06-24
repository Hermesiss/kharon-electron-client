import {ipcRenderer} from 'electron'
import {KharonNotification} from '../../common/KharonNotification'

const getText = (err, app) => {
  // simple error
  if (typeof (err) === 'string') {
    return err
  }

  // custom error
  if (err.response?.data) {
    if (err.response.data.type) {
      return app.$i18n.t(`error.type.${err.response.data.type}`)
    }
    if (err.response.data.message) {
      return err.response.data.message
    }
  }

  // standard error
  return err.message ?? err
}

export const state = () => ({
  /** @type {Array<KharonNotification>} */
  notifications: []
})

export const mutations = {
  /**
   *
   * @param state
   * @param {KharonNotification} notification
   */
  showNotification(state, notification) {
    state.notifications.push(notification)
  },
  /**
   *
   * @param state
   * @param {string | number}notificationId
   */
  hideNotification(state, notificationId) {
    const index = state.notifications.findIndex(x => x.id === notificationId)
    if (index >= 0) {
      state.notifications.splice(index, 1)
    }
  },
  showError(state, err) {
    const app = this
    const text = getText(err, app)

    const notification = new KharonNotification(text, {
      mode: 'error',
      timeout: 10000
    })

    this.commit('showNotification', notification)
  }
}

export const actions = {
  initStore(context) {
    ipcRenderer.on('notification',
      /**
       * @param {Electron.IpcRendererEvent} event
       * @param {KharonNotification} notification
       */
      (event, notification) => {
        console.log('notification', notification)
        context.commit('showNotification', notification)
      })
  }
}
