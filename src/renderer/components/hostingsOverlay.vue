<template>
  <v-dialog v-model="dialog" persistent max-width="800px">
    <v-card min-height="600px">
      <v-card-title class="headline">Hostings</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-btn color="primary" @click="createEmpty">Add</v-btn>
            <v-list>
              <v-list-item-group v-model="selectedHostingIndex" color="primary">
                <v-list-item v-for="hosting in hostings" :key="hosting.id" @click="selectHosting(hosting)">
                  <v-list-item-content>
                    <v-list-item-title>{{ hosting.rootPath }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-col>
          <v-col cols="6">
            <v-card v-if="showEdit">
              <v-form ref="form"
                      v-model="valid"
              >
                <v-card-text>
                  <v-select v-model="selectedHosting.company" :items="companies" item-text="companyName" item-value="id"
                            :label="$t('company.company')"
                            required :rules="rules.required"
                  />
                  <v-text-field v-model="selectedHosting.rootPath" :label="$t('apps.editor.rootPath')"
                                required :rules="rules.required"
                                placeholder="https://example.com/apps"
                  />
                  <v-text-field v-model="selectedHosting.ftpHost" :label="$t('apps.editor.ftpHost')"
                                required :rules="rules.required"
                                placeholder="1.1.1.1"
                  />
                  <v-text-field v-model="selectedHosting.ftpPath" :label="$t('apps.editor.ftpPath')"
                                required :rules="rules.required"
                                placeholder="apps"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-btn color="error" :disabled="!deletable" @click="_delete">
                    Delete
                  </v-btn>
                  <v-btn color="warning" :disabled="!changed" @click="discard">
                    Discard
                  </v-btn>
                  <v-spacer/>
                  <v-btn color="success" :disabled="!valid || !changed" @click="save">
                    Save
                  </v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-spacer/>
      <v-card-actions>
        <v-btn color="red darken-1" text @click="close">Close</v-btn>
        <v-spacer/>
        <v-btn color="green darken-1" text :disabled="!selectable" @click="select">Select</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapActions, mapState} from 'vuex'

export default {
  name: 'HostingsOverlay',
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialog: this.showDialog,
      /** @type {KharonHosting | null} */
      selectedHosting: null,
      /** @type {KharonHosting | null} */
      originalHosting: null,
      selectedHostingIndex: null,
      valid: false,
    }
  },
  computed: {
    ...mapState({
      hostings: state => state.hosting.hostings,
      isFetching: state => state.hosting.isFetching,
      companies: state => state.company.companies,
    }),
    selectable() {
      console.log(this.selectedHostingIndex)
      return this.selectedHostingIndex !== null && this.selectedHostingIndex !== undefined
    },
    deletable() {
      return this.selectedHosting.id !== ''
    },
    showEdit() {
      if (this.selectedHosting === null) return false
      if (this.selectedHosting === undefined) return false
      return true
    },
    rules() {
      return {
        required: [
          v => !!v || this.$i18n.t('common.rules.required'),
        ],
      }
    },
    changed() {
      return JSON.stringify(this.selectedHosting) !== JSON.stringify(this.originalHosting)
    },
  },
  watch: {
    async showDialog(val) {
      this.dialog = val
      if (val) {
        this.selectedHosting = null
        await this.fetchHostings()
        this.selectFirst()
      }
    },
    dialog(val) {
      this.$emit('update:showDialog', val)
    },
  },
  methods: {
    close() {
      this.dialog = false
    },
    select() {
      this.$emit('select', this.selectedHosting)
      this.dialog = false
    },
    selectHosting(hosting) {
      if (JSON.stringify(this.selectedHosting) === JSON.stringify(hosting)) {
        this.selectedHosting = null
        return
      }
      this.selectedHosting = JSON.parse(JSON.stringify(hosting))
      this.originalHosting = hosting
    },
    createEmpty() {
      this.selectedHosting = {
        id: '',
        company: '',
        rootPath: '',
        ftpHost: '',
        ftpPath: '',
      }
      this.selectedHostingIndex = null
    },
    discard() {
      this.selectedHosting = JSON.parse(JSON.stringify(this.originalHosting))
    },
    selectFirst() {
      if (this.hostings.length === 0) {
        this.selectedHostingIndex = null
        this.selectedHosting = null
        return
      }
      this.selectedHostingIndex = 0
      this.selectHosting(this.hostings[0])
    },
    async _delete() {
      if (this.selectedHosting.id) {
        await this.deleteHosting(this.selectedHosting.id)
        await this.fetchHostings()
        this.selectFirst()
      }
    },
    async save() {
      let id = this.selectedHosting.id
      if (id) {
        await this.updateHosting(this.selectedHosting)
      } else {
        const h = await this.createHosting(this.selectedHosting)
        id = h.id
      }
      await this.fetchHostings()
      this.selectedHostingIndex = this.hostings.findIndex(x => x.id === id)

      this.selectHosting(this.hostings[this.selectedHostingIndex])
    },
    ...mapActions({
      fetchHostings: 'hosting/fetchHostings',
      updateHosting: 'hosting/updateHosting',
      createHosting: 'hosting/createHosting',
      deleteHosting: 'hosting/deleteHosting',
    }),
  },

}
</script>
<style scoped>
.v-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
