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
    const isAdmin = rootGetters['user/isAdmin']
    return isAdmin ? state.selectedCompany : getters.getCompanyById(rootGetters['auth.currentUser']?.company)
  },
}

export const actions = {
  async selectCompany(state, company) {
    state.commit('setSelectedCompany', company)
    if (company?.apps) { await state.dispatch('app/fetchApps', company.apps, {root: true}) }
  },
  async fetchCompanies(state) {
    const companies = await this.$axios.$get('/companies/')
    state.commit('setCompanies', companies)
    const getter = state.getters.getSelectedCompany
    await state.dispatch('selectCompany', companies.find(x => x.id === getter?.id))
  },
  /* {
        "companyName": String,
        "companyPrefix": String,
  } */
  async createCompany(state, company) {
    const resp = await this.$axios.$post('/companies/create', company)
    await state.dispatch('fetchCompanies')
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
    return resp.data
  },
}
