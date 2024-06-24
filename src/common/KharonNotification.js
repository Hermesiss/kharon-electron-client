let increment = 0

export class KharonNotification {
  /**
   *
   * @param {string} content
   * @param {string | number} [id]
   * @param {'info' | 'success' | 'warning' | 'error' | 'primary' } [mode]
   * @param {number} [timeout]
   * @param {boolean} [dismissible]
   */
  constructor(content, {
    id = increment++,
    mode = 'primary',
    timeout = -1,
    dismissible = true
  } = {}) {
    this.content = content
    this.mode = mode
    this.timeout = timeout
    this.dismissible = timeout <= 0 ? true : dismissible
    this.id = id
  }
}
