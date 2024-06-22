import AutoLaunch from 'auto-launch'
import {app, ipcMain} from 'electron'

const appAutoLauncher = new AutoLaunch({
  name: 'KharonApp',
  path: app.getPath('exe')
})

export const configure = () => {
  ipcMain.on('auto-launch', (event, value) => {
    console.log('auto-launch', value)
    if (value) {
      appAutoLauncher.enable()
    } else {
      appAutoLauncher.disable()
    }
  })
  ipcMain.handle('auto-launch-status', async () => {
    const value = await appAutoLauncher.isEnabled()
    console.log('auto-launch-status', value)
    return value
  })
}
