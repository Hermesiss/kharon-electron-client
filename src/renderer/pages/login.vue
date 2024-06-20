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
          <v-text-field
            v-model="computerName"
            :label="$t('settings.computerName')"
            type="text"
          />

          <v-btn type="submit">{{ $t('common.submit') }}</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapGetters, mapMutations, mapState} from 'vuex'

export default {
  name: 'Login',
  auth: false,
  data() {
    return {
      login: {
        username: '',
        password: '',
      },
      computerName: ''
    }
  },
  computed: {
    ...mapState({
      compName: state => state.settings.computerName,
      username: state => state.settings.username
    })
  },
  mounted() {
    this.computerName = this.compName
    this.login.username = this.username
  },
  methods: {
    ...mapMutations({
      startProgress: 'overlay/startProgress',
      stopProgress: 'overlay/stopProgress',
      showError: 'notifications/showError',
      setComputerName: 'settings/setComputerName',
      setUsername: 'settings/setUsername'
    }),
    async userLogin() {
      try {
        this.startProgress()
        const result = await this.$auth.loginWith('local', {data: this.login})
        console.log('RESULT:', result)
        this.setComputerName(this.computerName)
        this.setUsername(this.login.username)
        await this.$router.push('/')
      } catch (err) {

      } finally {
        this.stopProgress()
      }
    }
  }
}
</script>
