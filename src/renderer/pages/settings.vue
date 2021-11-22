<template>
  <v-container fill-height>
    <v-row align="center"
           justify="center"
    >
      <v-col
        cols="12"
        md="8"
      >
        <v-card class="my-4">
          <v-card-title>{{ $t('settings.title') }}</v-card-title>
          <v-card-text>
            <v-list>
              <v-select v-model="currentLocale" :label="$t('settings.language')"
                        :items="availableLocales" item-text="name" item-value="code"
              />
              <update-checker/>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn color="warning" @click="logout"> {{ $t('settings.logout') }}</v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-if="false" class="my-4">
          <v-card-title>{{ $t('settings.management') }}</v-card-title>
          <v-card-text>
            <v-list/>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn color="warning"> btn</v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-if="isAdmin" class="my-4">
          <v-card-title>{{ $t('settings.admin') }}</v-card-title>
          <v-card-text>
            <v-list>
              <v-text-field v-model="ftpPassword" :label="$t('settings.ftp-password')"
                            :append-icon="showFtpPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="showFtpPassword ? 'text' : 'password'"
                            @click:append="showFtpPassword = !showFtpPassword"
              />
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn color="warning"> btn</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapGetters, mapMutations, mapState} from 'vuex'
import UpdateChecker from '../components/updateChecker'

export default {
  name: 'Settings',
  components: {UpdateChecker},
  data() {
    return {
      showFtpPassword: false
    }
  },
  computed: {
    ...mapState({
      ftpPwd: state => state.settings.ftpPwd
    }),
    ...mapGetters({
      isAdmin: 'user/isAdmin'
    }),
    ftpPassword: {
      get() {
        return this.ftpPwd
      },
      set(newPwd) {
        this.setFtpPwd(newPwd)
      }
    },
    availableLocales() {
      return this.$i18n.locales
    },
    currentLocale: {
      get() {
        return this.$i18n.locale
      },
      set(newValue) {
        console.log('SET', newValue)
        this.$i18n.setLocale(newValue)
      }
    },
  },
  methods: {
    ...mapMutations({setFtpPwd: 'settings/setFtpPassword'}),
    async logout() {
      try {
        await this.$auth.logout('local')
      } catch (err) {
        console.error(err)
      }
    }
  },

}
</script>

<style scoped>

</style>
