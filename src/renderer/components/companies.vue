<template>
  <v-card class="fill-height">
    <v-card-title>
      {{ $t('companies.title') }}
      <v-flex/>
      <v-btn icon @click="openEditDialogue(null)">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-card-title>
    <v-list>
      <v-list-item-group
        v-model="selected"
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
            {{ companyId ? $t('company.editor.title.edit') : $t('company.editor.title.create') }}
          </v-card-title>

          <v-card-text>
            <v-text-field v-model="companyName" :label="$t('company.editor.companyName')"/>
            <v-text-field v-model="companyPrefix" :label="$t('company.editor.companyPrefix')"/>
          </v-card-text>

          <v-divider/>

          <v-card-actions>
            <v-btn v-if="companyId" color="error"
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
    companyName: '',
    companyPrefix: '',
    companyId: null,
  }),
  computed: {
    ...mapGetters({
      userRole: 'users/currentUserRole',
    }),
    ...mapState({
      companies: state => state.companies.companies,
      selectedCompany: state => state.companies.selectedCompany
    }),
    selected() {
      return this.companies.indexOf(this.selectedCompany)
    }
  },
  methods: {
    ...mapActions({
      createCompany: 'companies/createCompany',
      updateCompany: 'companies/updateCompany',
      deleteCompany: 'companies/deleteCompany',
    }),
    ...mapMutations({
      setSelectedCompany: 'companies/setSelectedCompany'
    }),
    openEditDialogue(company) {
      this.companyName = company?.companyName
      this.companyPrefix = company?.companyPrefix
      this.companyId = company?.id
      this.editDialogue = true
    },
    selectCompany(company) {
      if (company === this.selectedCompany) {
        company = null
      }

      this.setSelectedCompany(company)
    },
    saveCompany() {
      console.log('SAVE COMPANY')
      const company = {companyName: this.companyName, companyPrefix: this.companyPrefix}
      if (this.companyId) {
        company.id = this.companyId
        this.updateCompany(company)
      } else {
        this.createCompany(company)
      }
    },
    deleteCompanyPrompt() {
      if (confirm(`Are you sure you want to delete company ${this.companyName}?`)) {
        this.deleteCompany(this.companyId)
        return true
      }

      return false
    },
    /* selectCompany(company) {
     } */
  }
}
</script>

<style scoped>

</style>
