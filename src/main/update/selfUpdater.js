import isDev from 'electron-is-dev'

import {autoUpdater} from 'electron-updater'
import {KharonNotification} from '../../common/KharonNotification'
import {sendToRenderer} from '../utils'

autoUpdater.autoDownload = false
autoUpdater.allowDowngrade = true

if (isDev) {
  autoUpdater.updateConfigPath = 'dist/publish/win-unpacked/resources/app-update.yml'
}

autoUpdater.on('error', error => {
  console.error('Error while checking for updates', error)
  const notification = new KharonNotification('Update fetch error\n' + error, {
    mode: 'error',
    timeout: 10000
  })
  sendToRenderer('notification', notification)
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

const changeUpdateServer = options => {
  autoUpdater.setFeedURL(options)
}

const installSelf = () => {
  setImmediate(() => autoUpdater.quitAndInstall())
}

const downloadSelf = async (onProgress, onStartDownload, onEndDownload) => {
  onProgressFunc = onProgress
  onStartDownloadFunc = onStartDownload
  onEndDownloadFunc = onEndDownload
  if (onStartDownloadFunc) onStartDownloadFunc()
  await autoUpdater.downloadUpdate()
}

/**
 *
 * @param onFetchResult
 * @return {Promise<UpdateCheckResult|null>}
 */
const checkForUpdatesSelf = async onFetchResult => {
  onFetchResultFunc = onFetchResult
  if (process.env.NODE_ENV === 'development') {
    const url = `${process.env.DEBUG_URL}/ftp/launcher`
    autoUpdater.setFeedURL(url)
  }

  try {
    const result = await autoUpdater.checkForUpdates()
    console.log('checkForUpdatesSelf result', result)
    return result
  } catch (error) {
    console.error('Error while checking for updates', error)
    return null
  }
}

export default {
  checkForUpdatesSelf,
  downloadSelf,
  installSelf,
  changeUpdateServer
}
