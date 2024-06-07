const endpoint = '/api/hostings'

/** @typedef {object} KharonHosting
 * @property {string} id
 * @property {string} company - owner company id
 * @property {string} ftpHost - ftp domain or ip e.g. "1.1.1.1"
 * @property {string} ftpPath - path inside ftp e.g. "/www/trismegistus.tech/kharon/apps/"
 * @property{string} rootPath - path for download e.g. "https://trismegistus.tech/kharon/apps"
 */

export const state = () => ({
  /** @type {KharonHosting[]} */
  hostings: [],
  isFetching: false
})

export const mutations = {
  /**
   *
   * @param state
   * @param {KharonHosting[]} hostings
   */
  setHostings(state, hostings) {
    state.hostings = hostings
  },
  /**
   * @param state
   * @param {boolean} isFetching
   */
  setFetching(state, isFetching) {
    state.isFetching = isFetching
  },
  /**
   * @param state
   * @param {KharonHosting} hosting
   */
  addHosting(state, hosting) {
    if (!state.hostings) {
      state.hostings = []
    }

    if (state.hostings.some(x => x.id === hosting.id)) return
    state.hostings.push(hosting)
  }
}

export const getters = {
  getAll: state => state.hostings,
  /**
   *
   * @param state
   * @return {function(String): KharonHosting | undefined}
   */
  getHostingById: state => id => {
    return state.hostings.find(c => c.id === id)
  },
  getFetching: state => state.isFetching
}

export const actions = {
  /**
   *
   * @param state
   * @param {Array<string>}hostingIds
   * @return {Promise<void>}
   */
  async fetchHostings(state, hostingIds) {
    const isAdmin = state.rootGetters['user/isAdmin']
    if (!isAdmin) return

    state.commit('setFetching', true)
    let hostings = []
    if (!hostingIds) {
      hostings = await this.$axios.$get(endpoint)
    } else {
      for (const id of hostingIds) {
        const hosting = await this.$axios.$get(`${endpoint}/${id}`)
        hostings.push(hosting)
      }
    }
    state.commit('setHostings', hostings)
    state.commit('setFetching', false)
  },
  /**
   *
   * @param state
   * @param {KharonHosting} hosting
   * @return {Promise<*>}
   */
  async createHosting(state, hosting) {
    const resp = await this.$axios.$post(`${endpoint}/create`, hosting)
    state.commit('addHosting', resp)
    console.log('created hosting', resp)
    return resp
  },
  /**
   *
   * @param state
   * @param {KharonHosting} hosting
   * @return {Promise<void>}
   */
  async updateHosting(state, hosting) {
    await this.$axios.$put(`${endpoint}/${hosting.id}`, hosting)
  },
  /**
   *
   * @param state
   * @param {String} hostingId
   * @return {Promise<void>}
   */
  async deleteHosting(state, hostingId) {
    await this.$axios.$delete(`${endpoint}/${hostingId}`)
  }
}
