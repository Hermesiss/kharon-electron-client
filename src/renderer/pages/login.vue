<template>
  <v-container fill-height>
    <v-row align="center"
           justify="center"
    >
      <v-col
        cols="12"
        md="6"
      >
        <h1>{{ $t('login.caption') }}</h1>
        <v-form @submit.prevent="userLogin">
          <v-text-field
            v-model="login.username"
            :label="$t('login.username')"
            type="text"
          />

          <v-text-field
            v-model="login.password"
            :label="$t('login.password')"
            type="password"
          />

          <v-btn type="submit">{{ $t('common.submit') }}</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapMutations} from 'vuex'

export default {
  name: 'Login',
  auth: false,
  data() {
    return {
      login: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    ...mapMutations({
      startProgress: 'overlay/startProgress',
      stopProgress: 'overlay/stopProgress',
      showError: 'notifications/showError'
    }),
    async userLogin() {
      try {
        this.startProgress()
        const result = await this.$auth.loginWith('local', {data: this.login})
        console.log('RESULT:', result)
        await this.$router.push('/')
      } catch (err) {

      } finally {
        this.stopProgress()
      }
    }
  }
}
</script>
