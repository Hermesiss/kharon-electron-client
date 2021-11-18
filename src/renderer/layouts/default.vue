<template>
  <v-app>
    <v-main>
      <v-app-bar v-if="isLogged">
        <v-app-bar-nav-icon v-if="!isNavPermanent" @click.stop="drawer = !drawer"/>
      </v-app-bar>
      <v-navigation-drawer v-if="isLogged"
                           v-model="drawer"
                           :permanent="isNavPermanent"
                           app
                           class="pa-0"
      >
        <v-layout column fill-height class="overflow-y-hidden" >
          <v-toolbar-title class="text-center py-2">Hello, {{ username }}</v-toolbar-title>
          <v-list >
            <v-list-item to="/">
              <v-list-item-content>
                <v-list-item-title class="text-h6">
                  Home
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
          <v-spacer/>
          <update-checker/>
        </v-layout>
      </v-navigation-drawer>
      <nuxt/>
    </v-main>
  </v-app>
</template>

<script>

import UpdateChecker from '../components/updateChecker'

export default {
  components: {UpdateChecker},
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
    async logout() {
      try {
        await this.$auth.logout('local')
      } catch (err) {
        console.error(err)
      }
    },

  }
}
</script>

<style>
body {
  margin: 0 !important;
}
</style>
