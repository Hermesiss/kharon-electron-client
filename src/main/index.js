import { app, ipcMain} from 'electron'
import {checkForUpdates} from './updater'

ipcMain.on('check-update', (event, args) => {
  console.log(event, args)
  checkForUpdates()
  event.returnValue = true
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

// Load here all startup windows
require('./mainWindow')
