<template>
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
                           color="success"
        />
        <div v-else>
          <v-progress-linear
            :value="uploadState.percent"
            height="25"
            color="success"
          >
            {{ uploadState.count }} / {{ uploadState.totalCount }}
          </v-progress-linear>
          <p>{{ getFileState }}</p>
          <p>{{ uploadState.currentFilePath }}: {{ getCurrentSize }}</p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import fs from 'fs'
import {ipcRenderer} from 'electron'
import {mapActions, mapGetters, mapState} from 'vuex'
import humanize from 'humanize'

export default {
  name: 'AppDownloader',
  data() {
    return {
      showUploadProcess: false,
      uploadState: {
        count: 0,
        totalCount: 1,
        bytes: 0,
        totalBytes: 1
      },
    }
  },
  computed: {
    ...mapGetters({
      getAppConfig: 'app/getAppConfig'
    }),
    ...mapState({
      appToInstall: state => state.download.appToInstall
    }),
    getFileState() {
      return `${humanize.filesize(this.uploadState.bytes)}/${humanize.filesize(this.uploadState.totalBytes)}`
    },
    getCurrentSize() {
      return humanize.filesize(this.uploadState.currentFileSize)
    },
  },
  watch: {
    appToInstall(newApp) {
      console.log('NEW APP', newApp)
      this.startDownload(newApp.app, newApp.version)
    }
  },
  mounted() {
    ipcRenderer.on('app-download-progress', (_, progress) => {
      this.uploadState = progress
    })
  },
  methods: {
    ...mapActions({
      downloadManifest: 'app/downloadManifest',
      fetchApps: 'app/fetchApps',
    }),
    async startDownload(app, version) {
      const appConfig = this.getAppConfig(app.appCode)

      if (!appConfig) {
        console.error(`AppConfig for ${app} not found`)
        return
      }

      appConfig.set('version', version)
      appConfig.set('installed', true)
      appConfig.set('downloaded', false)
      const appPath = `C:/Temp/${app.appCode}` // TODO get from config or ask
      appConfig?.set('installedPath', appPath)

      this.uploadState = null
      this.showUploadProcess = true

      const manifest = await this.downloadManifest({app, versionCode: version})

      let diff = null
      if (fs.existsSync(appPath)) {
        const currentManifest = await ipcRenderer.invoke('manifest-generate', appPath)
        diff = await ipcRenderer.invoke('manifest-diff', currentManifest, manifest)
      }
      await ipcRenderer.invoke('download-app', manifest, app, appPath, diff)
      this.showUploadProcess = false
      appConfig.set('downloaded', true)
      await this.fetchApps()
    },
  }
}
</script>

<style scoped>

</style>
