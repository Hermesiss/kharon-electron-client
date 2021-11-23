<template>
  <v-card class="fill-height">
    <v-card-title>
      {{ selectedApp.appName }}
      <v-flex/>
    </v-card-title>
    <v-card-subtitle>[{{ selectedApp.appCode }}]</v-card-subtitle>
  </v-card>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'SelectedApp',
  computed: {
    ...mapState({
      selectedApp: state => state.app.selectedApp
    })
  }
}
</script>

<style scoped>

</style>
