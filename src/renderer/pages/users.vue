<template>
  <div>
    <v-container fluid fill-height>
      <v-row class="fill-height" no-gutters>
        <v-col cols="12" class="fill-height py-0">
          <v-data-table
            :headers="filteredHeaders"
            :items="users"
            :items-per-page="15"
            class="elevation-1"
          >
            <template #top>
              <v-toolbar
                flat
              >
                <v-toolbar-title>Users</v-toolbar-title>
                <v-divider
                  class="mx-4"
                  inset
                  vertical
                />
                <v-spacer/>
                <v-btn
                  color="primary"
                  class="mb-2"
                  @click="editUser(null)"
                >
                  New user
                </v-btn>
              </v-toolbar>
            </template>
            <template #item.company="{item}">
              {{ item.company ? getCompanyById(item.company).companyName : '' }}
            </template>
            <template #item.apps="{item}">
              <v-chip v-for="(app, index) in getApps(item)" :key="index">
                {{ getAppById(app) ? getAppById(app).appCode : '' }}
              </v-chip>
            </template>
            <template #item.actions="{ item }">
              <v-icon
                small
                class="mr-2"
                @click="editUser(item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                small
                @click="deleteUserPrompt(item)"
              >
                mdi-delete
              </v-icon>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog
      v-model="userEditDialog"
      persistent
      min-width="600"
      max-width="1200"
    >
      <v-card v-if="editedUser">
        <v-card-title>
          Edit user
        </v-card-title>
        <v-card-text>
          <v-form ref="form"
                  v-model="valid"
          >
            <v-text-field v-if="editedUser.id" v-model="editedUser.id" label="ID" disabled/>

            <v-select v-if="isAdmin"
                      v-model="editedUser.company" :items="companies" item-text="companyName" item-value="id"
                      :label="$t('company.company')"
                      required :rules="rules.required"
            />
            <v-text-field v-model="editedUser.firstName" :label="$t('users.editor.firstName')" required
                          :rules="rules.required"
            />
            <v-text-field v-model="editedUser.usernameSplitted" :label="$t('users.editor.username')"
                          :disabled="editedUser.role !== 'user'"
                          required :rules="rules.required"
            >
              <template v-if="editedUser.role === 'user'" #prepend>
                {{
                  getCompanyById(editedUser.company).companyPrefix
                }}@
              </template>
            </v-text-field>
            <v-text-field v-model="editedUser.password" :label="$t('users.editor.password')"
                          :hint="!editedUser.id ? '' : $t('users.editor.passwordHint')" persistent-hint
                          :rules="!editedUser.id ? rules.required : []"
            />
            <v-select v-if="editedUser.role === 'user'" v-model="editedUser.apps" :items="filteredApps"
                      item-text="appCode"
                      item-value="id"
                      multiple
                      :label="$t('users.editor.apps')"
                      required :rules="rules.required"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn
            color="green darken-1"
            text
            @click="userEditDialog = false"
          >
            {{ $t('common.discard') }}
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            :disabled="!valid"
            @click="saveUser"
          >
            {{ $t('common.submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex'

export default {
  name: 'Users',
  data() {
    return {
      headers: [
        {text: 'Username', value: 'username'},
        {text: 'First name', value: 'firstName'},
        // {text: 'Last name', value: 'lastName'},
        {text: 'Created', value: 'createdDate'},
        {text: 'Role', value: 'role'},
        {text: 'Company', value: 'company', adminOnly: true},
        {text: 'Apps', value: 'apps'},
        {text: 'Actions', value: 'actions', sortable: false},
      ],
      userEditDialog: false,
      /**
       * @type {KharonUser | null}
       */
      editedUser: null,
      valid: false
    }
  },
  computed: {
    ...mapState({
      users: state => state.user.users,
      companies: state => state.company.companies,
      apps: state => state.app.apps
    }),
    ...mapGetters({
      currentUser: 'user/currentUser',
      getCompanyById: 'company/getCompanyById',
      isAdmin: 'user/isAdmin',
      getAllApps: 'company/getAllApps',
      getAppById: 'app/getAppById'
    }),
    filteredHeaders() {
      const isAdmin = this.isAdmin
      return this.headers.filter(x => !x.adminOnly || x.adminOnly === isAdmin)
    },
    rules() {
      return {
        required: [
          v => !!v || this.$i18n.t('common.rules.required'),
        ],
      }
    },
    filteredApps() {
      return this.apps.filter(x => x.company === this.editedUser.company)
    }
  },
  async mounted() {
    await this.updateUsers()
  },
  methods: {
    ...mapActions({
      fetchUsers: 'user/fetchUsers',
      fetchApps: 'app/fetchApps',
      fetchCompanies: 'company/fetchCompanies',
      fetchCompanyById: 'company/fetchCompanyById',
      fetchMyCompanyUsers: 'user/fetchMyCompanyUsers',
      createUser: 'user/createUser',
      updateUser: 'user/updateUser',
      deleteUser: 'user/deleteUser',
    }),
    async saveUser() {
      this.userEditDialog = false
      const user = this.editedUser
      if (user.role === 'user') {
        user.username = `${this.getCompanyById(user.company).companyPrefix}@${user.usernameSplitted}`
      }
      if (!user.lastName) {
        user.lastName = user.firstName
      }
      if (user.id) {
        await this.updateUser(user)
      } else {
        await this.createUser(user)
      }
      this.editedUser = null

      await this.updateUsers()
    },
    /**
     *
     * @param {KharonUser | null} user
     */
    editUser(user) {
      if (!user) {
        user = {
          company: this.currentUser.company,
          role: 'user'
        }
      }
      if (user.username) {
        const splitted = user.username.split('@')
        user.usernameSplitted = splitted.length === 2 ? splitted[1] : user.username
      }
      this.editedUser = {...user}
      this.userEditDialog = true
    },
    /**
     *
     * @param {KharonUser} user
     */
    async deleteUserPrompt(user) {
      if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
        await this.deleteUser(user.id)
      }
    },
    /**
     *
     * @param {KharonUser} user
     */
    getApps(user) {
      if (user.role !== 'user') {
        return this.getCompanyById(user.company)?.apps
      }
      return user.apps
    },
    async updateUsers() {
      if (this.isAdmin) {
        await this.fetchCompanies()
        await this.fetchApps(this.getAllApps)
        await this.fetchUsers()
      } else {
        await this.fetchCompanyById(this.currentUser.company)
        await this.fetchApps(this.getAllApps)
        await this.fetchMyCompanyUsers()
      }
    }
  }
}
</script>

<style scoped>

</style>
