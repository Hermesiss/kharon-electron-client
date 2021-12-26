<template>
  <v-list class="py-0">
    <v-list-item :disabled="!updateButtonState" :loading="isFetching" :class="getButtonClass" @click="getButtonAction">
      <v-progress-linear v-model="downloadProgress" color="green"
                         absolute height="100%" striped :active="isDownloading"
                         style="z-index: 1"
      />
      <v-list-item-content style="z-index: 2">
        <v-list-item-title>{{ getButtonTitle }}</v-list-item-title>
        <v-list-item-subtitle>{{ getButtonSubtitle }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import {ipcRenderer} from 'electron'
import humanize from 'humanize'
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'
import {UpdateState} from '~/plugins/types'

export default {
  name: 'UpdateChecker',

  data() {
    return {
      updateProgress: 0,
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
      downloadSize: state => state.download.downloadSize,
      isFetching: state => state.download.isFetching,
      isDownloading: state => state.download.isDownloading
    }),
    updateButtonState() {
      return !this.isDownloading && !this.isFetching
    },
    getButtonClass() {
      switch (this.currentUpdateState) {
        case UpdateState.NewAvailable:
        case UpdateState.CanInstall:
          return 'success'
        default:
          return ''
      }
    },
    getButtonTitle() {
      switch (this.currentUpdateState) {
        case UpdateState.CanInstall:
          return this.$i18n.t('updater.title.canInstall')
        case UpdateState.Actual:
          return this.$i18n.t('updater.title.actual')
        case UpdateState.Fetching:
          return this.$i18n.t('updater.title.fetching')
        case UpdateState.NewAvailable:
          return this.$i18n.t('updater.title.newAvailable') + ` ${humanize.filesize(this.downloadSize)}`
        case UpdateState.Downloading:
          return this.$i18n.t('updater.title.downloading')
        default:
          return ''
      }
    },
    getButtonSubtitle() {
      switch (this.currentUpdateState) {
        case UpdateState.CanInstall:
          return `${this.$i18n.t('updater.subtitle.downloaded')}
           [${this.installedVersion}] -> [${this.downloadedVersion}]`
        case UpdateState.NewAvailable: // Update available
          return `${this.$i18n.t('updater.subtitle.available')}
           [${this.installedVersion}] -> [${this.availableVersion}]`
        case UpdateState.Downloading:
          return `${humanize.filesize(this.downloadedBytes)}/${humanize.filesize(this.downloadSize)}`
        default:
          return `${this.$i18n.t('updater.subtitle.actual-version')} [${this.installedVersion}]`
      }
    },
    getButtonAction() {
      if (this.isPending) return this.installUpdate
      if (!this.isActual) return this.downloadUpdate
      return this.checkUpdate
    },
  },
  async mounted() {
    await this.getInstalledVersion()
  },
  methods: {
    ...mapActions({
      checkUpdate: 'download/checkUpdate',
      downloadUpdate: 'download/downloadUpdate',
      installUpdate: 'download/installUpdate',
      getInstalledVersion: 'download/getInstalledVersion'
    }),
  }
}
</script>

<style scoped>

</style>
