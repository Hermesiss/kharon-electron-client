const {app, ipcMain} = require('electron')
const {checkForUpdates, download, install} = require('./updater')

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

// Load here all startup windows
require('./mainWindow')

ipcMain.handle('get-version', () => app.getVersion())

ipcMain.handle('check-update', async () => {
  return await checkForUpdates(
    result => console.log('Fetched with result', result))
})

ipcMain.handle('download-update', async () => {
  const webContents = require('electron').webContents.getFocusedWebContents()
  return await download(
    progress => webContents.send('downloadProgress', progress),
    () => webContents.send('downloadState', true),
    () => {
      webContents.send('downloadState', false)
      webContents.send('canUpdate')
    },
  )
})

ipcMain.handle('install-update', async () => {
  return install()
})
