<template>
  <v-card class="fill-height">
    <v-card-title>
      {{ selectedApp.appName }}
      <v-flex/>
    </v-card-title>
    <v-card-subtitle>[{{ selectedApp.appCode }}]</v-card-subtitle>
    <v-tabs v-model="tab"
            align-with-title
    >
      <v-tabs-slider/>

      <v-tab
        v-for="item in items"
        :key="item"
      >
        {{ $t(item) }}
      </v-tab>
    </v-tabs>
    <v-card-text>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-card>
            Main
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card>
            <versions/>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import {mapState} from 'vuex'
import Versions from './versions'

export default {
  name: 'SelectedApp',
  components: {Versions},
  data() {
    return {
      tab: null,
      items: [
        'apps.app.main',
        'apps.app.versions'
      ]
    }
  },
  computed: {
    ...mapState({
      selectedApp: state => state.app.selectedApp
    })
  },
}
</script>

<style scoped>

</style>
