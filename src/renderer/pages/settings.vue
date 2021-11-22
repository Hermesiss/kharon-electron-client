<template>
  <v-container fill-height>
    <v-row align="center"
           justify="center"
    >
      <v-col
        cols="12"
        md="6"
      >
        <v-card>
          <v-card-title>{{ $t('settings.title') }}</v-card-title>
          <v-card-text>
            <v-select
              v-model="currentLocale" :items="availableLocales" item-text="name" item-value="code"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer/><v-btn color="warning" @click="logout"> {{ $t('settings.logout') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'Settings',
  methods: {
    async logout() {
      try {
        await this.$auth.logout('local')
      } catch (err) {
        console.error(err)
      }
    }
  },
  computed: {
    ...mapState({

    }),
    availableLocales() {
      return this.$i18n.locales
    },
    currentLocale: {
      get () {
        return this.$i18n.locale
      },
      set (newValue) {
        console.log('SET', newValue)
        this.$i18n.setLocale(newValue)
      }
    }

  }
}
</script>

<style scoped>

</style>
