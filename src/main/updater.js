/**
 * updater.js
 *
 * Please use manual update only when it is really required, otherwise please use recommended non-intrusive auto update.
 *
 * Import steps:
 * 1. create `updater.js` for the code snippet
 * 2. require `updater.js` for menu implementation, and set `checkForUpdates`
 * callback from `updater` for the click property of `Check Updates...` MenuItem.
 */

const {dialog} = require('electron')
const isDev = require('electron-is-dev')

const {autoUpdater} = require('electron-updater')

autoUpdater.autoDownload = false
autoUpdater.allowDowngrade = true

if (isDev) {
  autoUpdater.updateConfigPath = 'dist/publish/win-unpacked/resources/app-update.yml'
}

autoUpdater.on('error', error => {
  dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString())
})

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want update now?',
    buttons: ['Sure', 'No']
  }).then(({response}) => {
    if (response === 0) {
      autoUpdater.downloadUpdate()
    } else {
      // TODO enable item
    }
  })
})

autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox({
    title: 'No Updates',
    message: 'Current version is up-to-date.'
  })
// TODO enable item
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }).then(() => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
})

autoUpdater.on('download-progress', progressObj => {
  console.log('Downloaded: ' + Math.floor(progressObj.percent) + '%')
})

// export this to MenuItem click callback
const checkForUpdates = (menuItem, focusedWindow, event) => {
// TODO disable item
  autoUpdater.checkForUpdates()
}
module.exports.checkForUpdates = checkForUpdates
