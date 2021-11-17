<template>
  <v-app>
    <v-main>
      <v-app-bar>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"/>
      </v-app-bar>
      <v-navigation-drawer
        v-model="drawer"
        absolute
      >
        <v-list>
          <v-list-item to="/">
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                Home
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/protected">
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                Protected
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="isLogged" @click="logout">
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                Log out
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-else to="/login">
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                Log in
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <nuxt/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  components: {},
  data() {
    return {
      drawer: false
    }
  },
  computed: {
    isLogged() {
      return this.$auth.loggedIn
    }
  },
  methods: {
    async logout() {
      try {
        const response = await this.$auth.logout('local')
        console.log(response)
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style>
body {
  margin: 0 !important;
}
</style>
