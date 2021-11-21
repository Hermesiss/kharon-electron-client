<template>
  <!--    <h1>{{ $t('common.helloWorld') }}</h1>
  <NuxtLink to="login">LOGIN</NuxtLink>-->
  <v-container fluid fill-height class="pa-0">
    <v-row class="fill-height " dense no-gutters>
      <v-col v-if="isAdmin" cols="4" class="fill-height">
        <companies fill-height/>
      </v-col>
      <v-col v-if="getSelectedCompany" cols="6" class="fill-height">
        <apps fill-height/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {remote} from 'electron'
import {mapGetters} from 'vuex'
import Companies from '../components/companies'
import Apps from '../components/apps'

export default {
  components: {Apps, Companies},
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
      isAdmin: 'user/isAdmin',
      getSelectedCompany: 'company/getSelectedCompany'
    })
  },
  async mounted() {
    await this.$store.dispatch('company/fetchCompanies')
  },
  methods: {
    openURL(url) {
      remote.shell.openExternal(url)
    }
  }
}
</script>

<style>
.e-nuxt-container {
  min-height: calc(100vh - 50px);
  background: linear-gradient(to right, #ece9e6, #ffffff);
  font-family: Helvetica, sans-serif;
}

.e-nuxt-content {
  display: flex;
  justify-content: space-around;
  padding-top: 100px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.e-nuxt-logo {
  width: 400px;
}

.e-nuxt-system-info {
  padding: 20px;
  border-top: 1px solid #397c6d;
  border-bottom: 1px solid #397c6d;
}

.e-nuxt-links {
  padding: 100px 0;
  display: flex;
  justify-content: center;
}

.e-nuxt-button {
  color: #364758;
  padding: 5px 20px;
  border: 1px solid #397c6d;
  margin: 0 20px;
  border-radius: 15px;
  font-size: 1rem;
}

.e-nuxt-button:hover {
  cursor: pointer;
  color: white;
  background-color: #397c6d;
}
</style>
