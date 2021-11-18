<template>
  <v-list class="py-0">
    <v-list-item :disabled="!updateButtonState" :loading="fetching" :class="getButtonClass" @click="getButtonAction">
      <v-progress-linear v-model="downloadProgress" color="green"
                         absolute height="100%" striped :active="isDownloading"
      />
      <v-list-item-content style="z-index: 100">
        <v-list-item-title>{{ getButtonTitle }}</v-list-item-title>
        <v-list-item-subtitle>{{ getButtonSubtitle }}</v-list-item-subtitle>
        <!--        <v-btn :disabled="!updateButtonState"
               :loading="fetching"
               tile
               block
               @click="getButtonAction"
        >
          {{ getButtonTitle }}
        </v-btn>-->
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import {ipcRenderer} from 'electron'
import humanize from 'humanize'
import {mapGetters, mapMutations, mapState} from 'vuex'
import {UpdateState} from '~/plugins/types'

export default {
  name: 'UpdateChecker',

  data() {
    return {
      updateButtonState: true,
      updateProgress: 0,
      fetching: false,
      isDownloading: false
    }
  },
  computed: {
    ...mapGetters({
      isActual: 'download/isActual',
      isPending: 'download/isPending',
      currentUpdateState: 'download/currentUpdateState',
      downloadedBytes: 'download/downloadedBytes'
    }),
    ...mapState({
      downloadProgress: state => state.download.downloadProgress,
      installedVersion: state => state.download.installedVersion,
      availableVersion: state => state.download.availableVersion,
      downloadedVersion: state => state.download.downloadedVersion,
      downloadSize: state => state.download.downloadSize
    }),
    getButtonClass() {
      switch (this.currentUpdateState) {
      case UpdateState.NewAvailable:
      case UpdateState.CanInstall:
        return 'success'
      default:
        return ''
      }

      /* switch (this.currentUpdateState) {
        case UpdateState.CanInstall:
          break;
        case UpdateState.Actual:
          break;
        case UpdateState.Fetching:
          break;
        case UpdateState.NewAvailable:
          break;
        case UpdateState.Downloading:
          break;
        default:
          break;

      } */
    },
    getButtonTitle() {
      switch (this.currentUpdateState) {
      case UpdateState.CanInstall:
        return 'Restart and update'
      case UpdateState.Actual:
        return 'Check for update'
      case UpdateState.Fetching:
        return 'Fetching...'
      case UpdateState.NewAvailable:
        return `Download ${humanize.filesize(this.downloadSize)}`

      case UpdateState.Downloading:
        return 'Downloading...'
      default:
        return ''
      }

      /* if (this.isDownloading) return 'Downloading...'
      if (this.isPending) return 'Restart and update'
      if (!this.isActual) {
        return `Download ${humanize.filesize(this.$store.state.download.downloadSize)}`
      }
      return 'Check for update' */
    },
    getButtonSubtitle() {
      switch (this.currentUpdateState) {
      case UpdateState.CanInstall:
        return `Update downloaded [${this.installedVersion}] -> [${this.downloadedVersion}]`
      case UpdateState.NewAvailable:
        return `Update available [${this.installedVersion}] -> [${this.availableVersion}]`
      case UpdateState.Downloading:
        return `${humanize.filesize(this.downloadedBytes)}/${humanize.filesize(this.downloadSize)}`
      default:
        return `Actual version [${this.installedVersion}]`
      }

      /* if (this.isPending) {
        return `Update available [${this.installedVersion}] -> [${this.downloadedVersion}]`
      }
      if (!this.isActual) {
        return `Update available [${this.installedVersion}] -> [${this.availableVersion}]`
      }
      return `Actual version [${this.installedVersion}]` */
    },
    getButtonAction() {
      if (this.isPending) return this.installUpdate
      if (!this.isActual) return this.downloadUpdate
      return this.checkUpdate
    },
  },
  async mounted() {
    const appVersion = process.env.NODE_ENV === 'development' ? '0.0.1' : await ipcRenderer.invoke('get-version')
    const app = this
    this.setInstalledVersion(appVersion)

    ipcRenderer.on('downloadProgress', (_, progress) => this.setDownloadProgress(progress))
    ipcRenderer.on('downloadState', (_, state) => {
      if (state) {
        app.setDownloadedVersionAsAvailable()
      }

      app.setDownloading(state)
    })
    // ipcRenderer.on('canUpdate', () => this.setNeedUpdate())
  },
  methods: {
    async checkUpdate() {
      this.setButtonState(false)
      this.setFetching(true)
      const result = await ipcRenderer.invoke('check-update', '')
      this.$store.commit('download/setAvailableVersion', result.updateInfo.version)
      this.$store.commit('download/setDownloadSize', result.updateInfo.files.reduce((a, x) => a + x.size, 0))
      this.setButtonState(true)
      this.setFetching(false)
    },
    async downloadUpdate() {
      this.setDownloadProgress(0)
      this.setButtonState(false)
      this.isDownloading = true
      await ipcRenderer.invoke('download-update', '')
      this.isDownloading = false
      this.setButtonState(true)
    },
    async installUpdate() {
      await ipcRenderer.invoke('install-update', '')
    },
    setButtonState(mode) {
      this.updateButtonState = mode
    },
    ...mapMutations({
      setDownloadProgress: 'download/setDownloadProgress',
      setFetching: 'download/setFetching',
      setDownloading: 'download/setDownloading',
      setDownloadedVersionAsAvailable: 'download/setDownloadedVersionAsAvailable',
      setInstalledVersion: 'download/setInstalledVersion',
    })

  }
}
</script>

<style scoped>

</style>
