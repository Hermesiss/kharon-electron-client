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

autoUpdater.on('update-available', async () => {
  if (onFetchResultFunc) onFetchResultFunc(true)
})

autoUpdater.on('update-not-available', async () => {
  if (onFetchResultFunc) onFetchResultFunc(false)
})

autoUpdater.on('update-downloaded', async () => {
  if (onEndDownloadFunc) onEndDownloadFunc()
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

const install = () => {
  setImmediate(() => autoUpdater.quitAndInstall())
}

const download = async (onProgress, onStartDownload, onEndDownload) => {
  onProgressFunc = onProgress
  onStartDownloadFunc = onStartDownload
  onEndDownloadFunc = onEndDownload
  if (onStartDownloadFunc) onStartDownloadFunc()
  await autoUpdater.downloadUpdate()
}

const checkForUpdates = async onFetchResult => {
  onFetchResultFunc = onFetchResult
  return await autoUpdater.checkForUpdates()
}
module.exports = {checkForUpdates, download, install}
