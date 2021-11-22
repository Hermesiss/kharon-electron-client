import ElectronStore from 'electron-store'

const settingsSchema = {
  ftpPassword: {type: 'string', default: ' '}
}

const settingsStore = new ElectronStore({name: 'kharon-config', schema: settingsSchema})

const ftpPasswordKey = 'ftpPassword'
export const state = () => ({
  ftpPwd: settingsStore.get(ftpPasswordKey)
})

export const mutations = {
  setFtpPassword(state, pwd) {
    settingsStore.set(ftpPasswordKey, pwd)
    state.ftpPwd = pwd
  }
}
