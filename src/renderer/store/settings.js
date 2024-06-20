import {execSync} from 'child_process'
import ElectronStore from 'electron-store'
import {ipcRenderer} from 'electron'

function getSystemUUID() {
  try {
    const stdout =
      execSync('powershell -Command "Get-WmiObject -Class Win32_ComputerSystemProduct ' +
        '| Select-Object -ExpandProperty UUID"')
    return stdout.toString().trim()
  } catch (error) {
    console.error(`Error: ${error}`)
    throw error
  }
}

const settingsSchema = {
  ftpPassword: {
    type: 'string',
    default: ' '
  },
  computerName: {
    type: 'string',
    default: 'user_pc'
  },
  username: {
    type: 'string',
    default: ' '
  }
}

const settingsStore = new ElectronStore({
  name: 'kharon-config',
  schema: settingsSchema
})

const ftpPasswordKey = 'ftpPassword'
export const state = () => ({
  ftpPwd: settingsStore.get(ftpPasswordKey),
  computerName: settingsStore.get('computerName'),
  username: settingsStore.get('username'),
  systemUUID: getSystemUUID()
})

export const mutations = {
  setFtpPassword(state, pwd) {
    settingsStore.set(ftpPasswordKey, pwd)
    state.ftpPwd = pwd
  },
  setComputerName(state, name) {
    settingsStore.set('computerName', name)
    state.computerName = name
  },
  setUsername(state, username) {
    settingsStore.set('username', username)
  }
}

export const actions = {
  async registerComputer(context) {
    const data = {
      computerName: context.state.computerName,
      systemUUID: context.state.systemUUID,
      port: context.rootState.server.port,
      secure: false // set true if you are using https
    }
    await this.$axios.$post('/api/remote/register', data)
  },
  async exitApp() {
    console.log('Exit app')
    await ipcRenderer.invoke('exit-app')
  },
  async reloadApp() {
    console.log('Reload app')
    await ipcRenderer.invoke('reload-app')
  }
}
