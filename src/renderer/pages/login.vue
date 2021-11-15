<template>
  <div>
    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="12"
        >
          <v-form @submit.prevent="userLogin">
            <v-text-field
              v-model="login.username"
              label="Username"
              type="text"
            />

            <v-text-field
              v-model="login.password"
              label="Password"
              type="password"
            />

            <v-btn type="submit">Submit</v-btn>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
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
    async userLogin() {
      try {
        const response = await this.$auth.loginWith('local', {data: this.login})
        console.log(response)
        await this.$router.push('/')
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>
