export const state = () => ({
  /** @type {Array<KharonUser>} */
  users: []
})
/**
 * @typedef {('user'|'owner'|'admin')} Role
 */

/**
 * @typedef {Object} KharonUser
 * @property {Role} role
 * @property {string} username
 * @property {string} [password]
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} company
 * @property {string} createdDate
 * @property {string} id
 * @property {string} usernameSplitted
 * @property {Array<String>} apps
 */

export const getters = {
  /**
   *
   * @param state
   * @param getters
   * @param rootState
   * @return {KharonUser}
   */
  currentUser: (state, getters, rootState) => {
    return rootState.auth.user
  },
  /**
   *
   * @param state
   * @param getters
   * @return {Role | undefined}
   */
  currentUserRole: (state, getters) => {
    return getters.currentUser?.role
  },
  /**
   *
   * @param state
   * @param getters
   * @return {boolean}
   */
  isOwner: (state, getters) => {
    return getters.currentUserRole === 'owner'
  },
  /**
   *
   * @param state
   * @param getters
   * @return {boolean}
   */
  isAdmin: (state, getters) => {
    return getters.currentUserRole === 'admin'
  },
  /**
   *
   * @param state
   * @param getters
   * @return {function(Array<Role>): boolean}
   */
  isRoleSatisfies: (state, getters) => roles => {
    if (!roles) return true
    /** @type {Role | undefined} */
    const currentRole = getters.currentUserRole
    console.log('CURRENT ROLE', currentRole, 'ROLES', roles)
    console.log('INCLUDES', roles.includes(currentRole))
    return roles.includes(currentRole)
  }
}

export const mutations = {
  /**
   *
   * @param state
   * @param {Array<KharonUser>} users
   */
  setUsers(state, users) {
    state.users = users
  }
}

export const actions = {
  async fetchUsers(state) {
    const resp = await this.$axios.$get('users/')
    console.log('USERS', resp)
    state.commit('setUsers', resp)
    return resp
  },
  async fetchMyCompanyUsers(state) {
    const resp = await this.$axios.$get('users/myCompany')
    console.log('MY USERS', resp)
    state.commit('setUsers', resp)
    return resp
  },
  /**
   * @typedef {Object} UserCreateDTO
   * @property {String} username
   * @property {String} hash
   * @property {String} firstName
   * @property {String} lastName
   * @property {String} company
   * @property {Role} [role]
   * @property {Array<String>} [apps]
   */

  /**
   *
   * @param state
   * @param {UserCreateDTO} user
   * @return {Promise<void>}
   */
  async createUser(state, user) {
    const resp = await this.$axios.$post('users/create', user)
    return resp.data
  },

  /**
   * @typedef {Object} IId
   * @property {String} id
   *
   * @typedef {UserCreateDTO & IId} UserUpdateDTO
   */

  /**
   *
   * @param state
   * @param {UserUpdateDTO} user
   * @return {Promise<void>}
   */
  async updateUser(state, user) {
    const resp = await this.$axios.$put(`users/${user.id}`, user)
    return resp.data
  },

  /**
   *
   * @param state
   * @param {String} userId
   * @return {Promise<*>}
   */
  async deleteUser(state, userId) {
    const resp = await this.$axios.$delete(`users/${userId}`)
    return resp.data
  }
}
