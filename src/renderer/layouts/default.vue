<template>
  <v-app>
    <v-main>
      <!--      <v-app-bar v-if="isLogged" dense flat app>
        <v-app-bar-nav-icon v-if="!isNavPermanent" @click.stop="drawer = !drawer"/>
      </v-app-bar>-->
      <drawer/>
      <nuxt/>
    </v-main>
  </v-app>
</template>

<script>

import Drawer from '~/components/drawer/drawer'

export default {
  components: {Drawer},
  data() {
    return {}
  },
  computed: {},
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
