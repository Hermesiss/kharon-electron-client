<template>
  <v-app>
    <v-main>
      <v-app-bar v-if="isLogged" dense flat app>
        <v-app-bar-nav-icon v-if="!isNavPermanent" @click.stop="drawer = !drawer"/>
      </v-app-bar>
      <v-navigation-drawer v-if="isLogged"
                           v-model="drawer"
                           :permanent="isNavPermanent"
                           app
                           class="pa-0"
      >
        <v-layout column fill-height class="overflow-y-hidden">
          <v-toolbar-title class="text-center py-2">
            Hello, {{ username }}
          </v-toolbar-title>
          <v-list>
            <v-list-item to="/">
              <v-list-item-content>
                <v-list-item-title class="text-h6">
                  Home
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-spacer/>
          <v-list>
            <v-list-item v-if="isLogged" @click="logout">
              <v-list-item-content>
                <v-list-item-title class="text-h6">
                  Log out
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-else to="login">
              <v-list-item-content>
                <v-list-item-title class="text-h6">
                  Log in
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-for="locale in availableLocales" :key="locale.code"
                         :disabled="!locale.available"
                         :inactive="!locale.available"
                         @click.prevent.stop="$i18n.setLocale(locale.code)"
            >
              <v-list-item-content>
                <v-list-item-title class="text-h6">
                  {{ locale.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="testManifests">
              <v-list-item-content>
                <v-list-item-title class="text-h6">
                  Test manifests
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <update-checker/>
        </v-layout>
      </v-navigation-drawer>
      <nuxt/>
    </v-main>
  </v-app>
</template>

<script>

import {ipcRenderer} from 'electron'
import UpdateChecker from '../components/updateChecker'

export default {
  components: {UpdateChecker},
  data() {
    return {
      drawer: false,
      updateButtonState: true,
      updateProgress: 0,
      showDownloadState: false,
      oldManifest: {},
      newManifest: {},
      diff: {}
    }
  },
  computed: {
    isLogged() {
      return this.$auth.loggedIn
    },
    isNavPermanent() {
      return this.$vuetify.breakpoint.mdAndUp
    },
    username() {
      const user = this.$store.state.auth?.user

      return user ? (user.company ? user.company + ':' : '') + user.firstName : ''
    },
    availableLocales() {
      return this.$i18n.locales.map(i => {
        i.available = (i.code !== this.$i18n.locale)
        return i
      })
    }
  },
  methods: {
    async logout() {
      try {
        await this.$auth.logout('local')
      } catch (err) {
        console.error(err)
      }
    },
    async testManifests() {
      this.oldManifest = await ipcRenderer.invoke('manifest-generate',
        'd:\\Repos\\Intetix\\intetix-ritek-touch\\Builds\\Ritek-Touch-Full-1.1.5\\')
      this.newManifest = await ipcRenderer.invoke('manifest-generate',
        'd:\\Repos\\Intetix\\intetix-ritek-touch\\Builds\\Ritek-Touch-Full-1.1.6\\')
      this.diff = await ipcRenderer.invoke('manifest-diff', this.oldManifest, this.newManifest)
    }

  }
}
</script>

<style>
body {
  margin: 0 !important;
}
</style>
