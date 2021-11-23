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
  },
  addCompany(state, company) {
    if (state.companies.some(x => x.id === company.id)) return
    state.companies.push(company)
  }
}

export const getters = {
  getCompanyById: state => id => {
    console.log('GET COMPANY BY ID', id)
    return state.companies.find(c => c.id === id)
  },
  getSelectedCompany: (state, getters, rootState, rootGetters) => {
    const isAdmin = rootGetters['user/isAdmin']
    const currentUser = rootGetters['user/currentUser']
    console.log('CURRENT USER', currentUser)
    return isAdmin ? state.selectedCompany : getters.getCompanyById(currentUser?.company)
  },
}

export const actions = {
  async selectCompany(state, company) {
    state.commit('setSelectedCompany', company)
    if (company?.apps) {
      await state.dispatch('app/fetchApps', company.apps, {root: true})
    }
  },
  async fetchCompanyById(state, companyId) {
    const resp = await this.$axios.$get(`/companies/${companyId}`)
    console.log('FETCH COMPANY', resp)
    state.commit('addCompany', resp)
    return resp
  },
  async fetchCompanies(state) {
    const isAdmin = state.rootGetters['user/isAdmin']
    if (isAdmin) {
      const companies = await this.$axios.$get('/companies/')
      state.commit('setCompanies', companies)
      const getter = state.getters.getSelectedCompany
      await state.dispatch('selectCompany', companies.find(x => x.id === getter?.id))
    } else {
      const companyId = state.rootGetters['user/currentUser'].company
      console.log('COMPANY ID', companyId)
      const company = await state.dispatch('fetchCompanyById', companyId)
      await state.dispatch('selectCompany', company)
    }
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
