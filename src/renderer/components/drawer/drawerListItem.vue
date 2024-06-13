<template>
  <v-list-item :to="path" class="px-2" :style="{ backgroundColor: color }" @click="onclick">
    <v-list-item-avatar v-if="icon" ref="avatar">
      <v-badge bordered dot overlap :value="badgeValue"
               :color="badgeColor"
               :icon="badgeIcon"
      >
        <v-icon>{{ icon }}</v-icon>
      </v-badge>
    </v-list-item-avatar>
    <v-list-item-content ref="content">
      <v-list-item-title :color="color">
        {{ $t(caption) }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  name: 'DrawerListItem',
  props: {
    path: {
      type: String,
      required: false,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    caption: {
      type: String,
      required: true
    },
    badgeValue: {
      type: Boolean,
      default: false,
      required: false
    },
    badgeColor: {
      type: String,
      default: 'primary',
      required: false
    },
    badgeIcon: {
      type: String,
      default: null,
      required: false
    },
    color: {
      type: String,
      default: 'transparent',
      required: false
    }
  },
  methods: {
    onclick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>

</style>
