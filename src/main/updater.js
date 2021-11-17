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
const humanize = require('humanize')

autoUpdater.autoDownload = false
autoUpdater.allowDowngrade = true

if (isDev) {
  autoUpdater.updateConfigPath = 'dist/publish/win-unpacked/resources/app-update.yml'
}

autoUpdater.on('error', error => {
  dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString())
})

autoUpdater.on('update-available', async data => {
  const files = data.files
  const size = files.reduce((a, x) => a + x.size, 0)
  if (onFetchResultFunc) onFetchResultFunc(true)
  const response = await dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: `Found updates (${humanize.filesize(size)}), do you want update now?`,
    buttons: ['Yes', 'No']
  })
  if (response.response === 0) {
    if (onStartDownloadFunc) onStartDownloadFunc()
    await autoUpdater.downloadUpdate()
  } else {
    // TODO enable item
  }
})

autoUpdater.on('update-not-available', async () => {
  if (onFetchResultFunc) onFetchResultFunc(false)
  await dialog.showMessageBox({
    title: 'No Updates',
    message: 'Current version is up-to-date.'
  })
// TODO enable item
})

autoUpdater.on('update-downloaded', async () => {
  if (onEndDownloadFunc) onEndDownloadFunc()
  const response = await dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...',
    buttons: ['Now', 'Later']
  })
  if (response.response === 0) setImmediate(() => autoUpdater.quitAndInstall())
})

autoUpdater.on('download-progress', progressObj => {
  const progress = Math.floor(progressObj.percent)
  if (onProgressFunc) onProgressFunc(progress)
  console.log('Downloaded: ' + progress + '%')
})

let onFetchResultFunc
let onProgressFunc
let onStartDownloadFunc
let onEndDownloadFunc

// export this to MenuItem click callback
const checkForUpdates = async (onFetchResult, onProgress, onStartDownload, onEndDownload) => {
  onFetchResultFunc = onFetchResult
  onProgressFunc = onProgress
  onStartDownloadFunc = onStartDownload
  onEndDownloadFunc = onEndDownload
  await autoUpdater.checkForUpdates()
}
module.exports.checkForUpdates = checkForUpdates
