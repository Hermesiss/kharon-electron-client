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
      <v-list-item-group v-if="isFetching">
        <v-skeleton-loader v-for="index in skeletonNumber"
                           :key="index"
                           type="list-item-two-line"
        />
      </v-list-item-group>
      <v-list-item-group
        v-else
        :value="selected"
        color="primary"
      >
        <v-list-item v-for="app in apps"
                     :key="app.id" two-line
                     @click.stop.prevent="selectApp(app)"
        >
          <v-list-item-content>
            <v-list-item-title>{{ app.appName }}</v-list-item-title>
            <v-list-item-subtitle>[{{ app.appCode }}]: {{ getVersion(app) }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn v-if="isAdmin" icon @click.prevent.stop="openEditDialogue(app)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon @click.prevent.stop="startDownload(app)">
              <v-icon>mdi-download</v-icon>
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
                        required :rules="rules.required"
              />
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

export default {
  name: 'Apps',
  data: () => ({
    editDialogue: false,
    editedApp: {},
    valid: null
  }),
  computed: {
    ...mapGetters({
      userRole: 'user/currentUserRole',
      isAdmin: 'user/isAdmin'
    }),
    ...mapState({
      apps: state => state.app.apps,
      selectedApp: state => state.app.selectedApp,
      companies: state => state.company.companies,
      isFetching: state => state.app.isFetching,
      skeletonNumber: state => state.app.lastAppCount
    }),
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
    ipcRenderer.on('app-download-progress', (_, progress) => console.log('RENDERER PROGRESS', progress.totalPercent))
  },
  methods: {
    ...mapActions({
      createApp: 'app/createApp',
      updateApp: 'app/updateApp',
      deleteApp: 'app/deleteApp',
      fetchApps: 'app/fetchApps',
      fetchCompanies: 'company/fetchCompanies'
    }),
    ...mapMutations({
      setSelectedApp: 'app/setSelectedApp'
    }),
    openEditDialogue(app) {
      this.editedApp = {...app}
      this.editDialogue = true
    },
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
    getVersion(app) {
      if (app?.versions?.length > 0) {
        return `v${app.versions[0].version}`
      }

      return 'No version'
    },
    async startDownload(app) {
      await ipcRenderer.invoke('download-app', app, 'C:/Temp')
    }
  }
}
</script>

<style scoped>

</style>
