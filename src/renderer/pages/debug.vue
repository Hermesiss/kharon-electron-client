<template>
  <div>
    <v-btn @click="openDev()">Debug tools</v-btn>
  </div>
</template>

<script>
import {ipcRenderer} from 'electron'

export default {
  name: 'Debug',
  methods: {
    openDev() {
      ipcRenderer.invoke('debug')
    }
  }
}
</script>

<style scoped>

</style>
