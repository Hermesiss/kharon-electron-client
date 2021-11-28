<template>
  <v-card class="fill-height">
    <v-card-title>
      <v-list-item two-line>
        <v-list-item-content>
          <v-list-item-title>
            {{ selectedApp.appName }}
          </v-list-item-title>
          <v-list-item-subtitle>[{{ selectedApp.appCode }}] {{ installedVersion() }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-menu offset-y close-on-content-click>
            <template #activator="{ on, attrs }">
              <v-btn icon
                     v-bind="attrs"
                     v-on="on"
              >
                <v-icon>mdi-dots-horizontal</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(item, index) in menuItemsFiltered"
                :key="index"
                :disabled="item.enabled && !item.enabled()"
                @click="item.action()"
              >
                <v-list-item-icon>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title>{{ $t(item.captionKey) }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item-action>
      </v-list-item>
    </v-card-title>
    <v-card-actions>
      <div v-if="isInstalled()">
        <v-btn color="success" :disabled="!canLaunch()">
          <v-icon>mdi-play</v-icon>
          {{ $t('apps.menu.launch') }}
        </v-btn>
        <v-btn v-if="!isActual()" color="accent" @click="downloadApp">
          {{ $t('apps.menu.update') }} -> {{ latestVersion() }}
        </v-btn>
      </div>
      <div v-else>
        <v-btn color="accent" @click="downloadApp">
          <v-icon>mdi-download</v-icon>
          {{ $t('apps.menu.install') }}
        </v-btn>
      </div>
    </v-card-actions>
    <v-tabs v-model="tab"
            align-with-title
    >
      <v-tabs-slider/>

      <v-tab
        v-for="item in items"
        :key="item"
      >
        {{ $t(item) }}
      </v-tab>
    </v-tabs>
    <v-card-text>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-card>
            Main
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card>
            <versions/>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import {mapGetters, mapMutations, mapState} from 'vuex'
import {getLatest} from '../../plugins/helpers'
import Versions from './versions'

export default {
  name: 'SelectedApp',
  components: {Versions},
  data() {
    return {
      menuItems: [
        {
          action: () => this.editApp(),
          icon: 'mdi-pencil',
          captionKey: 'apps.menu.edit',
          rolesOnly: ['admin']
        },
        {
          action: () => this.launchApp(),
          icon: 'mdi-play',
          captionKey: 'apps.menu.launch',
          enabled: () => this.isInstalled()
        },
        {
          action: () => this.downloadApp(),
          icon: 'mdi-download',
          captionKey: 'apps.menu.install',
          enabled: () => !this.isInstalled(),
          show: () => !this.isInstalled()
        },
        {
          action: () => this.downloadApp(),
          icon: 'mdi-update',
          captionKey: 'apps.menu.update',
          enabled: () => !this.isActual(),
          show: () => this.isInstalled()
        },
      ],
      appConfig: null,
      tab: null,
      items: [
        'apps.app.main',
        'apps.app.versions'
      ]
    }
  },
  computed: {
    ...mapState({
      selectedApp: state => state.app.selectedApp
    }),
    ...mapGetters({
      isRoleSatisfies: 'user/isRoleSatisfies',
      getAppConfig: 'app/getAppConfig'
    }),
    menuItemsFiltered() {
      return this.menuItems.filter(x => {
        if (x.show && !x.show()) return false
        // v-if="!item.show && isRoleSatisfies(item.rolesOnly)"
        if (!this.isRoleSatisfies(x.rolesOnly)) return false

        return true
      })
    },
  },
  watch: {
    selectedApp() {
      this.updateAppInfo()
    }
  },
  mounted() {
    this.updateAppInfo()
  },
  methods: {
    ...mapMutations({
      setAppToInstall: 'download/setAppToInstall'
    }),
    editApp() {
    },
    launchApp() {
    },
    downloadApp() {
      const version = getLatest(this.selectedApp.versions)
      this.setAppToInstall({app: this.selectedApp, version})
    },
    installedVersion() {
      if (!this.appConfig || !this.appConfig.get('installed')) return ''
      return this.appConfig.get('version')
    },
    latestVersion() {
      return getLatest(this.selectedApp.versions)
    },
    isActual() {
      if (!this.appConfig) {
        console.log('APP CONFIG NULL')
        return false
      }

      const installed = this.appConfig.get('installed')
      if (!installed) return false
      const installedVersion = this.appConfig.get('version')
      const latest = getLatest(this.selectedApp.versions)
      return installedVersion === latest
    },
    isInstalled() {
      return this.appConfig?.get('installed')
    },
    updateAppInfo() {
      this.appConfig = this.getAppConfig(this.selectedApp.appCode)
    },
    canLaunch() {
      if (!this.appConfig || !this.appConfig.get('installed')) return false
      return this.appConfig.get('downloaded')
    }
  },
}
</script>

<style scoped>

</style>
