export const state = () => ({
  companies: [],
  selectedCompany: null
})

export const mutations = {
  setCompanies(state, companies) {
    state.companies = companies
  },
  setSelectedCompany(state, selectedCompany) {
    state.selectedCompany = selectedCompany
  }
}

export const getters = {
  getCompanyById: state => id => {
    return state.companies.find(c => c.id === id)
  },
  getSelectedCompany: (state, getters, rootState, rootGetters) => {
    const role = rootGetters['auth.currentUserRole']
    const isAdmin = role === 'admin'
    return isAdmin ? state.selectedCompany : getters.getCompanyById(rootGetters['auth.currentUser']?.company)
  },
}

export const actions = {
  async fetchCompanies(state) {
    state.commit('setCompanies', await this.$axios.$get('/companies/'))
  },
  /* {
        "companyName": String,
        "companyPrefix": String,
  } */
  async createCompany(state, company) {
    const resp = await this.$axios.$post('/companies/create', company)
    await state.dispatch('fetchCompanies')
    /* if (resp.error) {
      throw new Error(resp.error)
    } */
    return resp.data
  },
  /* {
        "companyName": String,
        "companyPrefix": String,
        "id": String
  } */
  async updateCompany(state, company) {
    const resp = await this.$axios.$put(`/companies/${company.id}`, company)
    await state.dispatch('fetchCompanies')
    return resp.data
  },
  async deleteCompany(state, companyId) {
    const resp = await this.$axios.$delete(`/companies/${companyId}`)
    await state.dispatch('fetchCompanies')
    /* if (resp.error) {
      throw new Error(resp.error)
    } */
    return resp.data
  },
}
