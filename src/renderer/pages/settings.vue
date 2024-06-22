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
              <v-text-field v-model="computerName" :label="$t('settings.computerName')"
                            type="text"
              />
              <v-select v-model="currentLocale" :label="$t('settings.language')"
                        :items="availableLocales" item-text="name" item-value="code"
              />
              <v-checkbox v-model="autoLaunch" :label="$t('settings.autoLaunch')"/>
              <update-checker/>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn color="warning" @click="logout"> {{ $t('settings.logout') }}</v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-spacer/>
            <v-btn color="error" @click="exit"> {{ $t('settings.exit') }}</v-btn>
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
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'
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
      ftpPwd: state => state.settings.ftpPwd,
      compName: state => state.settings.computerName,
      autoLnch: state => state.settings.autoLaunch
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
    computerName: {
      get() {
        return this.compName
      },
      set(newName) {
        this.setComputerName(newName)
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
        this.$i18n.setLocale(newValue)
      }
    },
    autoLaunch: {
      get() {
        return this.autoLnch
      },
      set(newValue) {
        this.setAutoLaunch(newValue)
      }
    }
  },
  mounted() {
    this.getAutoLaunch()
  },
  methods: {
    ...mapMutations({
      setFtpPwd: 'settings/setFtpPassword',
      setComputerName: 'settings/setComputerName',
      setApps: 'app/setApps',
      setCompanies: 'company/setCompanies',
      setUsers: 'user/setUsers',
      setAutoLaunch: 'settings/setAutoLaunch'
    }),
    ...mapActions({
      exitApp: 'settings/exitApp',
      getAutoLaunch: 'settings/getAutoLaunch'
    }),
    async exit() {
      await this.exitApp()
    },
    async logout() {
      try {
        await this.$auth.logout('local')
        this.setCompanies([])
        this.setApps([])
        this.setUsers([])
      } catch (err) {
        console.error(err)
      }
    }
  },

}
</script>

<style scoped>

</style>
