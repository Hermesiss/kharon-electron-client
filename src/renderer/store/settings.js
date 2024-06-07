import ElectronStore from 'electron-store'

const settingsSchema = {
  ftpPassword: {type: 'string', default: ' '},
  computerName: {type: 'string', default: 'user_pc'},
}

const settingsStore = new ElectronStore({name: 'kharon-config', schema: settingsSchema})

const ftpPasswordKey = 'ftpPassword'
export const state = () => ({
  ftpPwd: settingsStore.get(ftpPasswordKey),
  computerName: settingsStore.get('computerName')
})

export const mutations = {
  setFtpPassword(state, pwd) {
    settingsStore.set(ftpPasswordKey, pwd)
    state.ftpPwd = pwd
  },
  setComputerName(state, name) {
    settingsStore.set('computerName', name)
    state.computerName = name
  }
}
