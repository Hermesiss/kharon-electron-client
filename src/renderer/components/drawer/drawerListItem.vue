<template>
  <v-list-item :to="path" class="px-2">
    <v-list-item-avatar v-if="icon">
      <v-icon>{{ icon }}</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ $t(caption) }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  name: 'DrawerListItem',
  props: {
    path: {type: String, required: true},
    icon: {type: String, default: null},
    caption: {type: String, required: true}
  }
}
</script>

<style scoped>

</style>
