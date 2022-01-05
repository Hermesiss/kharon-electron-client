<template>
  <div>
    <v-snackbar v-for="(s,i) in notifications" :key="s.id" :style="{'margin-bottom':calcMargin(i)}" value="true"
                :timeout="s.timeout" right :color="s.mode" @input="mode => onInput(mode, s.id)"
    >
      {{ s.content }}
      <template #action="{ }">
        <v-btn
          v-if="s.dismissible"
          color="white" icon @click="hideNotification(s.id)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import {mapMutations, mapState} from 'vuex'

export default {
  name: 'Notifications',
  data: () => ({
    timeout: 4000,
  }),
  computed: {
    ...mapState({
      notifications: state => state.notifications.notifications
    })
  },
  methods: {
    ...mapMutations({
      showNotification: 'notifications/showNotification',
      hideNotification: 'notifications/hideNotification'
    }),
    calcMargin(i) {
      return (i * 68) + 'px'
    },
    onInput(mode, id) {
      if (mode === false) {
        this.hideNotification(id)
      }
    }
  },

}
</script>

<style scoped>

</style>
