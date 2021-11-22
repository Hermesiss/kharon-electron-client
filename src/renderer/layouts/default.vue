<template>
  <v-app>
    <v-main>
      <!--      <v-app-bar v-if="isLogged" dense flat app>
        <v-app-bar-nav-icon v-if="!isNavPermanent" @click.stop="drawer = !drawer"/>
      </v-app-bar>-->
      <v-navigation-drawer v-if="isLogged"
                           v-model="drawer"
                           :mini-variant="mini"
                           permanent
                           app
                           class="pa-0"
      >
        <v-layout column fill-height>
          <v-list>
            <v-list-item class="px-2">
              <v-list-item-avatar @click.stop="mini? (mini= !mini) : null">
                <v-icon>{{ userIcon }}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  {{ username }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  small
                  icon
                  @click.stop="mini = !mini"
                >
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item to="/" class="px-2">
              <v-list-item-avatar>
                <v-icon>mdi-home</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t('home.title') }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-spacer/>
          <v-list>
            <v-list-item @click="testManifests">
              <v-list-item-content>
                <v-list-item-title>
                  Test manifests
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item to="/settings" class="px-2">
              <v-list-item-avatar>
                <v-icon>mdi-cog</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  {{ $t('settings.title') }}
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
import {mapGetters} from 'vuex'
import UpdateChecker from '../components/updateChecker'

export default {
  components: {UpdateChecker},
  data() {
    return {
      drawer: false,
      mini: false,
      updateButtonState: true,
      updateProgress: 0,
      showDownloadState: false,
      oldManifest: {},
      newManifest: {},
      diff: {}
    }
  },
  computed: {
    ...mapGetters({
      userRole: 'user/currentUserRole',
    }),
    userIcon() {
      switch (this.userRole) {
      case 'admin':
        return 'mdi-shield-crown-outline'
      case 'owner':
        return 'mdi-account-hard-hat'
      default:
        return 'mdi-account'
      }
    },
    isLogged() {
      return this.$auth.loggedIn
    },
    isNavPermanent() {
      return this.$vuetify.breakpoint.mdAndUp
    },
    username() {
      const user = this.$store.state.auth?.user
      return user ? (user.company ? user.company + ':' : '') + user.firstName : ''
    }
  },
  methods: {
    async testManifests() {

    }
  }
}
</script>

<style>
body {
  margin: 0 !important;
}
</style>
