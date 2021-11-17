<template>
  <v-list>
    <v-list-item>
      <v-list-item-content>
        <v-btn :disabled="!updateButtonState"
               :loading="fetching"
               tile
               block
               @click="getButtonAction"
        >
          {{ getButtonName }}
        </v-btn>
      </v-list-item-content>
    </v-list-item>
    <v-progress-linear v-model="updateProgress"/>
  </v-list>
</template>

<script>
import {ipcRenderer} from 'electron'
import humanize from 'humanize'

export default {
  name: 'UpdateChecker',

  data() {
    return {
      updateButtonState: true,
      updateProgress: 0,
      showDownloadState: false,
      needToUpdate: false,
      fetching: false,
    }
  },
  computed: {
    isActual() {
      return this.$store.getters['download/isActual']
    },
    isPending() {
      return this.$store.getters['download/isPending']
    },
    getButtonName() {
      if (this.isPending) return 'Install'
      if (!this.isActual) return 'Download ' + humanize.filesize(this.$store.state.download.downloadSize)
      return 'Check'
    },
    getButtonAction() {
      if (this.isPending) return this.installUpdate
      if (!this.isActual) return this.downloadUpdate
      return this.checkUpdate
    }
  },
  mounted() {
    const appVersion = process.env.NODE_ENV === 'development' ? '0.0.1' : process?.version
    const store = this.$store
    store.commit('download/setInstalledVersion', appVersion)

    ipcRenderer.on('downloadProgress', (_, progress) => this.setProgress(progress))
    ipcRenderer.on('downloadState', (_, state) => {
      if (state) {
        store.commit('download/setDownloadedVersionAsAvailable')
      }
      this.showDownload(state)
    })
    ipcRenderer.on('canUpdate', () => this.setNeedUpdate())
  },
  methods: {
    async checkUpdate() {
      this.setButtonState(false)
      this.setFetching(true)
      const result = await ipcRenderer.invoke('check-update', '')
      console.log('UPDATE FETCH RESULT:', result)
      this.$store.commit('download/setAvailableVersion', result.updateInfo.version)
      this.$store.commit('download/setDownloadSize', result.updateInfo.files.reduce((a, x) => a + x.size, 0))
      this.setButtonState(true)
      this.setFetching(false)
    },
    async downloadUpdate() {
      this.setButtonState(false)
      const result = await ipcRenderer.invoke('download-update', '')
      console.log('START DOWNLOAD RESULT:', result)
      this.setButtonState(true)
    },
    async installUpdate() {
      const result = await ipcRenderer.invoke('install-update', '')
      console.log('START INSTALL RESULT:', result)
    },
    setButtonState(mode) {
      this.updateButtonState = mode
    },
    setFetching(mode) {
      this.fetching = mode
    },
    setProgress(percent) {
      this.updateProgress = percent
    },
    showDownload(mode) {
      this.showDownloadState = mode
    },
    setNeedUpdate() {
      this.needToUpdate = true
    },
  }
}
</script>

<style scoped>

</style>
