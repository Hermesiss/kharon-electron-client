<template>
  <div class="container">
    <h1 v-if="error.statusCode === 404">Page not found</h1>
    <h1 v-else-if="error.statusCode === 503">Server unavailable</h1>
    <h2 v-else>Unhandled error</h2>
    <p>{{ error.message }}</p>
    <v-btn color="warning" @click="goBack"> Back</v-btn>
    <v-btn color="error" @click="reloadApp"> Reload</v-btn>
  </div>
</template>

<script>
import {mapActions} from 'vuex'

export default {
  layout: 'error',
  props: ['error'],
  methods: {
    ...mapActions(
      {reloadApp: 'settings/reloadApp'}
    ),
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>
