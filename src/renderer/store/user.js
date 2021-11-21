export const state = () => ({

})

export const getters = {
  /*
    createdDate: Date,
    firstName: String,
    id: String,
    lastName: String,
    role: user|owner|admin,
    username: String,
   */
  currentUser: (state, getters, rootState) => {
    return rootState.auth.user
  },
  currentUserRole: (state, getters) => {
    return getters.currentUser?.role
  },
  isOwner: (state, getters) => {
    return getters.currentUserRole === 'owner'
  },
  isAdmin: (state, getters) => {
    return getters.currentUserRole === 'admin'
  },
}
