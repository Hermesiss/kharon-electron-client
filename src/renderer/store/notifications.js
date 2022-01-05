let increment = 0

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

export class KharonNotification {
  /**
   *
   * @param {string} content
   * @param {string | number} [id]
   * @param {'info' | 'success' | 'warning' | 'error' | 'primary' } [mode]
   * @param {number} [timeout]
   * @param {boolean} [dismissible]
   */
  constructor(content, {id = increment++, mode = 'primary', timeout = -1, dismissible = true} = {}) {
    this.content = content
    this.mode = mode
    this.timeout = timeout
    this.dismissible = timeout <= 0 ? true : dismissible
    this.id = id
  }
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

    const notification = new KharonNotification(text, {mode: 'error', timeout: 10000})

    this.commit('notifications/showNotification', notification)
  }
}
