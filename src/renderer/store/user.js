export const state = () => ({})
/**
 * @typedef {('user'|'owner'|'admin')} Role
 */

/**
 * @typedef {Object} KharonUser
 * @property {Role} role
 * @property {string} username
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} company
 * @property {string} createdDate
 * @property {string} id
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
    return roles.includes(currentRole)
  }
}
