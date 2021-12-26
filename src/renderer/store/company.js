export const state = () => ({
  /**
   * @type {Array<KharonCompany>}
   */
  companies: [],
  /**
   * @type {KharonCompany | null}
   */
  selectedCompany: null
})

/**
 *
 * @typedef {Object} KharonCompany
 * @property {String} companyName
 * @property {String} companyPrefix
 * @property {String} id
 * @property {Array<String>} apps
 */

export const mutations = {
  /**
   *
   * @param state
   * @param {Array<KharonCompany>} companies
   */
  setCompanies(state, companies) {
    state.companies = companies
  },
  /**
   *
   * @param state
   * @param {KharonCompany | null} selectedCompany
   */
  setSelectedCompany(state, selectedCompany) {
    state.selectedCompany = selectedCompany
  },
  /**
   *
   * @param state
   * @param {KharonCompany} company
   */
  addCompany(state, company) {
    if (state.companies.some(x => x.id === company.id)) return
    state.companies.push(company)
  }
}

export const getters = {
  /**
   *
   * @param state
   * @return {function(String): KharonCompany | undefined}
   */
  getCompanyById: state => id => {
    console.log('GET COMPANY BY ID', id)
    return state.companies.find(c => c.id === id)
  },
  /**
   *
   * @param state
   * @param getters
   * @param rootState
   * @param rootGetters
   * @return {KharonCompany | null | undefined}
   */
  getSelectedCompany: (state, getters, rootState, rootGetters) => {
    const isAdmin = rootGetters['user/isAdmin']
    const currentUser = rootGetters['user/currentUser']
    return isAdmin ? state.selectedCompany : getters.getCompanyById(currentUser?.company)
  },
}

export const actions = {
  /**
   *
   * @param state
   * @param {KharonCompany | null}company
   * @return {Promise<void>}
   */
  async selectCompany(state, company) {
    state.commit('setSelectedCompany', company)
    if (company?.apps) {
      await state.dispatch('app/fetchApps', company.apps, {root: true})
    }
  },
  /**
   *
   * @param state
   * @param {String} companyId
   * @return {Promise<KharonCompany>}
   */
  async fetchCompanyById(state, companyId) {
    const resp = await this.$axios.$get(`/companies/${companyId}`)
    console.log('FETCH COMPANY', resp)
    state.commit('addCompany', resp)
    return resp
  },
  /**
   *
   * @param state
   * @return {Promise<void>}
   */
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

  /**
   * @typedef {Object} CompanyCreateDTO
   * @property {String} companyName
   * @property {String} companyPrefix
   */

  /**
   *
   * @param state
   * @param {CompanyCreateDTO} company
   * @return {Promise<*>}
   */
  async createCompany(state, company) {
    const resp = await this.$axios.$post('/companies/create', company)
    await state.dispatch('fetchCompanies')
    return resp.data
  },

  /**
   * @typedef {Object} CompanyUpdateDTO
   * @property {String} companyName
   * @property {String} companyPrefix
   * @property {String} id
   */

  /**
   *
   * @param state
   * @param {CompanyUpdateDTO} company
   * @return {Promise<*>}
   */
  async updateCompany(state, company) {
    const resp = await this.$axios.$put(`/companies/${company.id}`, company)
    await state.dispatch('fetchCompanies')
    return resp.data
  },
  /**
   *
   * @param state
   * @param {String} companyId
   * @return {Promise<*>}
   */
  async deleteCompany(state, companyId) {
    const resp = await this.$axios.$delete(`/companies/${companyId}`)
    await state.dispatch('fetchCompanies')
    return resp.data
  },
}
