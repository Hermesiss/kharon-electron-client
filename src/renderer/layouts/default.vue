<template>
  <v-app>
    <v-main>
      <v-app-bar>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"/>
      </v-app-bar>
      <v-navigation-drawer
        v-model="drawer"
        absolute
      >
        <v-list>
          <v-list-item to="/">
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                Home
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item :disabled="!updateButtonState" @click="checkUpdate">
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                CheckForUpdate
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/protected">
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                Protected
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="isLogged" @click="logout">
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                Log out
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-else to="/login">
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                Log in
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <nuxt/>
      <v-footer v-if="showDownloadState" fixed app>
        <v-progress-linear v-model="updateProgress"/>
      </v-footer>
    </v-main>
  </v-app>
</template>

<script>
/* const { autoUpdater } = require('electron-updater')
autoUpdater.autoDownload = false */

// import {checkForUpdates} from '../../main/updater'

import {ipcRenderer} from 'electron'

export default {
  components: {},
  data() {
    return {
      drawer: false,
      updateButtonState: true,
      updateProgress: 0,
      showDownloadState: false
    }
  },
  computed: {
    isLogged() {
      return this.$auth.loggedIn
    }
  },
  methods: {
    async logout() {
      try {
        const response = await this.$auth.logout('local')
        console.log(response)
      } catch (err) {
        console.log(err)
      }
    },
    checkUpdate() {
      this.setButtonState(false)
      ipcRenderer.on('downloadProgress', (_, progress) => this.setProgress(progress))
      ipcRenderer.on('downloadState', (_, state) => this.showDownload(state))

      ipcRenderer.invoke('check-update', '')
        .then(() => this.setButtonState(true))
    },
    setButtonState(mode) {
      this.updateButtonState = mode
    },
    setProgress(percent) {
      this.updateProgress = percent
    },
    showDownload(mode) {
      this.showDownloadState = mode
    }
  }
}
</script>

<style>
body {
  margin: 0 !important;
}
</style>
