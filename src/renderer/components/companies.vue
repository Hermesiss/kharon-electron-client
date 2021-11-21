<template>
  <v-card class="fill-height">
    <v-card-title>
      {{ $t('companies.title') }}
      <v-flex/>
      <v-btn icon @click="fetchCompanies()">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn icon @click="openEditDialogue(null)">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-card-title>
    <v-list>
      <v-list-item-group
        :value="selected"
        color="primary"
      >
        <v-list-item v-for="company in companies"
                     :key="company.id" two-line
                     @click.stop.prevent="selectCompany(company)"
        >
          <v-list-item-content>
            <v-list-item-title>{{ company.companyName }}</v-list-item-title>
            <v-list-item-subtitle>[{{ company.companyPrefix }}]</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-avatar>{{ company.apps ? company.apps.length : '' }}</v-list-item-avatar>
          <v-list-item-action>
            <v-btn icon @click.prevent.stop="openEditDialogue(company)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <div class="text-center">
      <v-dialog
        v-model="editDialogue"
        width="500"
      >
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            {{ editedCompany.id ? $t('company.editor.title.edit') : $t('company.editor.title.create') }}
          </v-card-title>

          <v-card-text>
            <v-text-field v-model="editedCompany.companyName" :label="$t('company.editor.companyName')"/>
            <v-text-field v-model="editedCompany.companyPrefix" :label="$t('company.editor.companyPrefix')"/>
          </v-card-text>

          <v-divider/>

          <v-card-actions>
            <v-btn v-if="editedCompany.id" color="error"
                   @click.prevent.stop="deleteCompanyPrompt() && (editDialogue = false)"
            >
              {{ $t('common.delete') }}
            </v-btn>
            <v-spacer/>
            <v-btn
              color="warning"
              @click="editDialogue = false"
            >
              {{ $t('common.discard') }}
            </v-btn>
            <v-btn
              color="success"
              @click="editDialogue = false; saveCompany()"
            >
              {{ $t('common.save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-card>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'

export default {
  name: 'Companies',
  data: () => ({
    editDialogue: false,
    editedCompany: {
      id: '',
      companyName: '',
      companyPrefix: '',
      apps: []
    },
  }),
  computed: {
    ...mapGetters({
      userRole: 'user/currentUserRole',
    }),
    ...mapState({
      companies: state => state.company.companies,
      selectedCompany: state => state.company.selectedCompany
    }),
    selected() {
      return this.companies.findIndex(x => x.id === this.selectedCompany?.id)
    }
  },
  methods: {
    ...mapActions({
      createCompany: 'company/createCompany',
      updateCompany: 'company/updateCompany',
      deleteCompany: 'company/deleteCompany',
      setSelectedCompany: 'company/selectCompany',
      fetchCompanies: 'company/fetchCompanies'
    }),
    ...mapMutations({}),
    openEditDialogue(company) {
      this.editedCompany = {...company}
      this.editDialogue = true
    },
    selectCompany(company) {
      if (company === this.selectedCompany) {
        company = null
      }

      this.setSelectedCompany(company)
    },
    saveCompany() {
      if (this.editedCompany.id) {
        this.updateCompany(this.editedCompany)
      } else {
        this.createCompany(this.editedCompany)
      }
    },
    deleteCompanyPrompt() {
      if (confirm(`Are you sure you want to delete company "${this.editedCompany.companyName}"?`)) {
        this.deleteCompany(this.editedCompany.id)
        return true
      }

      return false
    },
  }
}
</script>

<style scoped>

</style>
