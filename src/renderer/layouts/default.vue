<template>
  <v-app>
    <v-main>
      <!--      <v-app-bar v-if="isLogged" dense flat app>
        <v-app-bar-nav-icon v-if="!isNavPermanent" @click.stop="drawer = !drawer"/>
      </v-app-bar>-->
      <drawer/>
      <nuxt/>
      <app-downloader/>
      <loading-overlay/>
      <notifications/>
    </v-main>
  </v-app>
</template>

<script>

import {mapActions} from 'vuex'
import Drawer from '~/components/drawer/drawer'
import AppDownloader from '~/components/appDownloader'
import LoadingOverlay from '~/components/loading-overlay'
import Notifications from '~/components/notifications'

export default {
  components: {Notifications, LoadingOverlay, AppDownloader, Drawer},
  data() {
    return {}
  },
  computed: {},
  mounted() {
    this.initStore()
  },
  methods: {
    ...mapActions({
      initStore: 'download/initStore'
    })
  }
}
</script>

<style>
body {
  margin: 0 !important;
}
</style>
