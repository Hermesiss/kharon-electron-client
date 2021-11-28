<template>
  <div>
    <v-btn v-if="isAdmin" @click="uploadDialog = !uploadDialog">Upload</v-btn>
    <v-list class="overflow-y-auto my-scrollable-list">
      <v-list-item v-for="version in selectedApp.versions" :key="version.version"
                   :class="isVersionInstalled(version.version)? 'installed-version' : ''"
                   class="pl-2"
      >
        <v-list-item-title>{{ version.version }}</v-list-item-title>
        <v-list-item-subtitle>{{ getDate(version) }}</v-list-item-subtitle>
        <v-list-item-action>
          <v-btn v-if="isAdmin" icon @click="deleteSelectedVersion(version)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn :disabled="isVersionInstalled(version.version)" icon
                 @click.prevent.stop="startDownload(version.version)"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-dialog
        v-model="uploadDialog"
        persistent
        min-width="600"
        max-width="1200"
      >
        <v-card>
          <v-card-title>
            Upload new version
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="newVersion"
                          :label="$t('apps.app.version')"
                          :error-messages="isVersionAvailable ? [] : ['Version in use']"
                          :error="!isVersionAvailable"
            />
            <v-text-field v-model="newChanges" :label="$t('apps.app.changes')"/>

            <v-text-field :value="selectedPath" readonly disabled :label="$t('apps.upload.localPath')">
              <template #prepend>
                <v-btn icon @click="browseFolder">
                  <v-icon>mdi-folder-open</v-icon>
                </v-btn>
              </template>
            </v-text-field>

            <h2>FTP <small> {{ getFtpUrl }} </small></h2>
            <v-text-field v-model="ftpUsername" :label="$t('login.username')"/>
            <v-text-field v-model="ftpPassword" :label="$t('login.password')"
                          :append-icon="showFtpPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          :type="showFtpPassword ? 'text' : 'password'"
                          @click:append="showFtpPassword = !showFtpPassword"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn
              color="green darken-1"
              text
              @click="uploadDialog = false"
            >
              {{ $t('common.discard') }}
            </v-btn>
            <v-btn
              color="green darken-1"
              text
              @click="startUploading"
            >
              {{ $t('common.submit') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="showUploadProcess"
        max-width="600"
        persistent
      >
        <v-card>
          <v-card-title/>
          <v-card-text>
            <v-progress-linear v-if="!uploadState"
                               height="25"
                               indeterminate
            />
            <div v-else>
              <v-progress-linear
                :value="uploadState.percent"
                height="25"
                :indeterminate="uploadState.indeterminate"
              >
                {{ uploadState.count }} / {{ uploadState.totalCount }}
              </v-progress-linear>
              <p>{{ getFileState }}</p>
              <p>{{ uploadState.currentFilePath }}: {{ getCurrentSize }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-list>
  </div>
</template>

<script>
import path from 'path'
import fs from 'fs'
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'
import humanize from 'humanize'
import {ipcRenderer} from 'electron'
import {getLatest} from '../../plugins/helpers'

export default {
  name: 'Versions',
  data: () => ({
    uploadDialog: false,
    showUploadProcess: false,
    uploadState: {
      count: 0,
      totalCount: 1,
      bytes: 0,
      totalBytes: 1
    },

    newVersion: null,
    newChanges: '',
    selectedPath: '',
    showFtpPassword: null
  }),
  computed: {
    ...mapState({
      selectedApp: state => state.app.selectedApp
    }),
    ...mapGetters({
      isAdmin: 'user/isAdmin',
      getApp: 'admin/getApp',
      getFtp: 'admin/getFtp',
      getAppConfig: 'app/getAppConfig'
    }),
    getFtpUrl() {
      return `ftp://${this.selectedApp.ftpHost}/${this.selectedApp.ftpPath}`
    },
    ftpUsername: {
      get() {
        return this.getFtp(this.selectedApp.ftpHost)?.username
      },
      set(val) {
        const host = this.selectedApp.ftpHost
        let ftp = this.getFtp(host)
        if (!ftp) {
          ftp = {}
        }
        ftp.username = val
        this.setFtp({host, ftp})
      }
    },
    ftpPassword: {
      get() {
        return this.getFtp(this.selectedApp.ftpHost)?.password
      },
      set(val) {
        const host = this.selectedApp.ftpHost
        let ftp = this.getFtp(host)
        if (!ftp) {
          ftp = {}
        }
        ftp.password = val
        this.setFtp({host, ftp})
      }
    },
    getFileState() {
      return `${humanize.filesize(this.uploadState.bytes)}/${humanize.filesize(this.uploadState.totalBytes)}`
    },
    getCurrentSize() {
      return humanize.filesize(this.uploadState.currentFileSize)
    },
    isVersionAvailable() {
      return !this.selectedApp.versions.some(x => x.version === this.newVersion)
    }
  },
  watch: {
    selectedApp() {
      this.updateNewVersion()
    }
  },
  mounted() {
    this.updateNewVersion()
    ipcRenderer.on('ftp-uploaded', (event, state) => {
      this.uploadState = state
    })
  },
  methods: {
    ...mapMutations({
      setApp: 'admin/setApp',
      setFtp: 'admin/setFtp',
      setAppToInstall: 'download/setAppToInstall'
    }),
    ...mapActions({
      addVersion: 'app/addVersion',
      deleteVersion: 'app/deleteVersion',
      fetchApps: 'app/fetchApps',
      downloadManifest: 'app/downloadManifest',
      diffManifests: 'app/diffManifests'
    }),
    getDate(version) {
      const date = new Date(version.date)
      return humanize.date('Y-m-d', date)
    },
    updateNewVersion() {
      if (this.selectedApp.versions.length > 0) {
        this.newVersion = getLatest(this.selectedApp.versions)
      } else {
        this.newVersion = '0.0.1'
      }

      this.newChanges = ''

      this.selectedPath = this.getApp(this.selectedApp.appCode)?.selectedPath

      this.appConfig = this.getAppConfig(this.selectedApp.appCode)
    },
    async browseFolder() {
      const newFolder = await ipcRenderer.invoke('get-folder')

      if (newFolder.cancelled) return
      if (newFolder.filePaths.length === 0) return

      this.selectedPath = newFolder.filePaths[0]

      const appCode = this.selectedApp.appCode
      let app = {...this.getApp(appCode)}
      if (!app) {
        app = {}
      }
      app.selectedPath = this.selectedPath
      this.setApp({appCode, app})
    },
    async startUploading() {
      console.log('WAITING FOR MANIFEST')
      this.uploadState = null
      this.showUploadProcess = true

      let latestManifest = null
      const latest = getLatest(this.selectedApp.versions)
      if (latest) {
        latestManifest = await this.downloadManifest({app: this.selectedApp, versionCode: latest})
      }

      const manifest = await ipcRenderer.invoke('manifest-generate',
        this.selectedPath,
        path.join(this.selectedPath, 'manifest.json'),
        latestManifest,
        this.newVersion
      )

      console.log('START UPLOADING')

      const upload = await ipcRenderer.invoke('upload-ftp', {
        appCode: this.selectedApp.appCode,
        version: this.newVersion,
        host: this.selectedApp.ftpHost,
        user: this.ftpUsername,
        password: this.ftpPassword,
        ftpPath: this.selectedApp.ftpPath,
        manifest,
        selectedPath: this.selectedPath
      })
      console.log('END UPLOADING', upload)
      this.showUploadProcess = false
      if (upload) {
        this.uploadDialog = false
        await this.addVersion({
          appId: this.selectedApp.id,
          version: this.newVersion,
          changes: this.newChanges
        })
        await this.fetchApps()
        // this.$emit('needUpdate')
      }
    },
    async deleteSelectedVersion(version) {
      if (confirm(`Are you sure you want to delete version "${version.version}"?`)) {
        await this.deleteVersion({
          appId: this.selectedApp.id,
          version: version.version
        })
        await this.fetchApps()
      }
    },
    async startDownload(version) {
      this.setAppToInstall({app: this.selectedApp, version})
    },
    isVersionInstalled(version) {
      return this.appConfig?.get('version') === version
    }
  }
}
</script>

<style scoped lang="sass">
@import '~vuetify/src/styles/main.sass'
.my-scrollable-list
  max-height: calc(100vh - 300px)

.installed-version
  background-color: map-get($deep-purple, lighten-5)
</style>
