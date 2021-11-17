const {app, ipcMain} = require('electron')
const {checkForUpdates} = require('./updater')

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

// Load here all startup windows
require('./mainWindow')

ipcMain.handle('check-update', async () => {
  const webContents = require('electron').webContents.getFocusedWebContents()
  console.log(webContents)
  await checkForUpdates(
    result => console.log('Fetched with result', result),
    progress => webContents.send('downloadProgress', progress),
    () => webContents.send('downloadState', true),
    () => webContents.send('downloadState', false),
  )
})
