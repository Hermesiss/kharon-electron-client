<template>
  <v-navigation-drawer v-if="isLogged"
                       v-model="drawer"
                       :mini-variant="mini"
                       permanent
                       app
                       class="pa-0"
  >
    <v-layout column fill-height>
      <v-list class="fill-height pa-0">
        <v-list-item class="px-2">
          <v-list-item-avatar @click.stop="mini? (mini= !mini) : null">
            <v-icon>{{ userIcon }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ username }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              small
              icon
              @click.stop="mini = !mini"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <drawer-list-item v-for="page in pages" :key="page.path" :caption="page.captionKey" :icon="page.icon"
                          :path="page.path"
        />
      </v-list>
    </v-layout>
    <template #append>
      <v-list>
        <drawer-list-item v-for="page in bottomPages" :key="page.path" :caption="page.captionKey" :icon="page.icon"
                          :path="page.path"
        />

        <drawer-list-item caption="settings.title" icon="mdi-cog"
                          path="/settings" :badge-value="!isActual"
        />
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script>
import {mapGetters} from 'vuex'
import DrawerListItem from '~/components/drawer/drawerListItem'

export default {
  name: 'Drawer',
  components: {DrawerListItem},
  data() {
    return {
      drawer: false,
      mini: false,
      pages: [
        {path: '/', icon: 'mdi-home', captionKey: 'home.title'},
        {path: '/users', icon: 'mdi-account-group', captionKey: 'users.title', rolesOnly: ['owner', 'admin']},
      ],
      bottomPages: [
        {path: '/debug', icon: 'mdi-hammer-wrench', captionKey: 'debug.title', rolesOnly: ['admin']},
        // {path: '/settings', icon: 'mdi-cog', captionKey: 'settings.title'}
      ],
    }
  },
  computed: {
    ...mapGetters({
      userRole: 'user/currentUserRole',
      isActual: 'download/isActual'
    }),
    isLogged() {
      return this.$auth.loggedIn
    },
    username() {
      const user = this.$store.state.auth?.user
      return user.firstName
    },
    userIcon() {
      switch (this.userRole) {
        case 'admin':
          return 'mdi-shield-crown-outline'
        case 'owner':
          return 'mdi-account-hard-hat'
        default:
          return 'mdi-account'
      }
    },
  }
}
</script>

<style scoped>

</style>
