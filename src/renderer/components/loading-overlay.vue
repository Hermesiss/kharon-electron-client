<template>
  <v-overlay
    v-model="showOverlay"
    width="200px"
    z-index="100"
    class="elevation-0"
  >
    <v-card height="200px" width="200px" elevation="0" color="transparent">
      <v-container fluid fill-height class="pa-0">
        <v-layout align-center justify-center>
          <v-progress-circular :indeterminate="indeterminate" :value="progress"/>
        </v-layout>
      </v-container>
    </v-card>
  </v-overlay>
</template>

<script>
import {mapMutations, mapState} from 'vuex'

export default {
  name: 'LoadingOverlay',
  data() {
    return {}
  },
  computed: {
    ...mapState({
      showOverlay: state => state.overlay.showOverlay,
      progress: state => state.overlay.progress
    }),

    indeterminate() {
      return this.progress < 0
    }
  },
  methods: {
    ...mapMutations({
      // setOverlay: 'overlay/setOverlay'
    })
  },

}
</script>

<style scoped>

</style>
