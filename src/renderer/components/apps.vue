<template>
  <v-card class="fill-height" width="300">
    <v-card-title>
      {{ $t('apps.title') }}
      <v-flex/>
      <v-btn icon @click="fetchApps()">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn v-if="isAdmin" icon @click="openEditDialogue(null)">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-card-title>
    <v-list>
      <v-list-item-group
        :value="selected"
        color="primary"
      >
        <v-list-item v-for="app in apps"
                     :key="app.id" two-line
                     @click.stop.prevent="selectApp(app)"
        >
          <v-list-item-content>
            <v-list-item-title>{{ app.appName }}</v-list-item-title>
            <v-list-item-subtitle>{{ getVersion(app) }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-btn v-if="isAdmin" icon @click.prevent.stop="openEditDialogue(app)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-list-item-action>
            <v-badge bordered dot :value="updateAvailable(app)" color="accent">
              <v-btn icon @click.prevent.stop="appInstalled(app.appCode) ? launchApp(app) : downloadAdd(app)">
                <v-icon>{{ appInstalled(app.appCode) ? 'mdi-play' : 'mdi-download' }}</v-icon>
              </v-btn>
            </v-badge>
            <!--            <v-btn v-if="isAdmin" icon @click.prevent.stop="openEditDialogue(app)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>-->
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
          <v-form ref="form"
                  v-model="valid"
          >
            <v-card-title class="text-h5 grey lighten-2">
              {{ editedApp.id ? $t('apps.editor.title.edit') : $t('apps.editor.title.create') }}
            </v-card-title>

            <v-card-text>
              <v-text-field v-model="editedApp.appName" :label="$t('apps.editor.appName')"
                            required :rules="rules.required"
              />
              <v-text-field v-model="editedApp.appCode" :label="$t('apps.editor.appCode')"
                            required :rules="rules.required"
              />
              <v-text-field v-model="editedApp.rootPath" :label="$t('apps.editor.rootPath')"
                            required :rules="rules.required"
              />
              <v-select v-model="editedApp.company" :items="companies" item-text="companyName" item-value="id"
                        :label="$t('company.company')"
                        required :rules="rules.required"
              />
              <h3>Deploy</h3>
              <v-text-field v-model="editedApp.ftpHost" :label="$t('apps.editor.ftpHost')"
                            required :rules="rules.required"
              />
              <v-text-field v-model="editedApp.ftpPath" :label="$t('apps.editor.ftpPath')"
                            required :rules="rules.required"
              />
              <v-text-field v-model="editedApp.exePath" :label="$t('apps.editor.exePath')"
                            required :rules="rules.required"
              />
              <v-text-field v-model="editedApp.exeParams" :label="$t('apps.editor.exeParams')"/>
            </v-card-text>

            <v-divider/>

            <v-card-actions>
              <v-btn v-if="editedApp.id" color="error"
                     @click.prevent.stop="deleteAppPrompt() && (editDialogue = false)"
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
                :disabled="!valid"
                @click="editDialogue = false; saveApp()"
              >
                {{ $t('common.save') }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
    </div>
  </v-card>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'
import {ipcRenderer} from 'electron'
import {getLatest} from '../plugins/helpers'

// noinspection JSCheckFunctionSignatures
export default {
  name: 'Apps',
  data: () => ({
    editDialogue: false,
    /** @type {AppCreateDTO | AppUpdateDTO | null}     */
    editedApp: null,
    valid: null
  }),
  computed: {
    ...mapGetters({
      userRole: 'user/currentUserRole',
      isAdmin: 'user/isAdmin',
      getAppConfig: 'app/getAppConfig'
    }),
    ...mapState({
      apps: state => state.app.apps,
      selectedApp: state => state.app.selectedApp,
      companies: state => state.company.companies,
      isFetching: state => state.app.isFetching,
    }),
    /**
     *
     * @return {number}
     */
    selected() {
      return this.apps.indexOf(this.selectedApp)
    },
    rules() {
      return {
        required: [
          v => !!v || this.$i18n.t('common.rules.required'),
        ],
      }
    }
  },
  mounted() {

  },
  methods: {
    ...mapActions({
      createApp: 'app/createApp',
      updateApp: 'app/updateApp',
      deleteApp: 'app/deleteApp',
      fetchApps: 'app/fetchApps',
      fetchCompanies: 'company/fetchCompanies',
      downloadManifest: 'app/downloadManifest',
      launch: 'app/launchApp'
    }),
    ...mapMutations({
      setSelectedApp: 'app/setSelectedApp',
      setAppToInstall: 'download/setAppToInstall'
    }),
    /**
     *
     * @param {KharonApp | null} app
     */
    openEditDialogue(app) {
      this.editedApp = {...app}
      this.editDialogue = true
    },
    /**
     *
     * @param {KharonApp | null} app
     */
    selectApp(app) {
      if (app === this.selectedApp) {
        app = null
      }

      this.setSelectedApp(app)
    },
    async saveApp() {
      if (this.editedApp.id) {
        await this.updateApp(this.editedApp)
      } else {
        await this.createApp(this.editedApp)
      }

      await this.fetchCompanies()
    },
    deleteAppPrompt() {
      if (confirm(`Are you sure you want to delete app "${this.editedApp.appName}"?`)) {
        this.deleteApp(this.editedApp.id)
        this.fetchCompanies()
        return true
      }

      return false
    },
    /**
     *
     * @param {KharonApp} app
     * @return {string|*}
     */
    getVersion(app) {
      const appConfig = this.getAppConfig(app.appCode)
      if (!appConfig?.get('installed')) return ''

      return appConfig?.get('version')
    },
    /**
     *
     * @param {String} appCode
     * @return {Boolean}
     */
    appInstalled(appCode) {
      const appConfig = this.getAppConfig(appCode)
      return appConfig?.get('installed')
    },
    /**
     *
     * @param {KharonApp} app
     */
    launchApp(app) {
      this.launch(app)
    },
    /**
     *
     * @param {KharonApp} app
     */
    downloadAdd(app) {
      const version = getLatest(app.versions)
      this.setAppToInstall({app, version})
    },
    /**
     *
     * @param {KharonApp} app
     */
    updateAvailable(app) {
      if (!this.appInstalled(app.appCode)) return false
      const current = this.getVersion(app)
      const latest = getLatest(app.versions)
      console.log('versions', current, latest)
      return latest !== current
    }
  }
}
</script>

<style scoped>

</style>
