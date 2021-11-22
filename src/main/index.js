const path = require('path')
const {app, ipcMain, BrowserWindow} = require('electron')
const {download} = require('electron-dl')
const fetch = require('electron-fetch').default
const {checkForUpdatesSelf, downloadSelf, installSelf} = require('./update/selfUpdater')

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
  return await checkForUpdatesSelf(
    result => console.log('Fetched with result', result))
})

ipcMain.handle('download-update', async () => {
  const webContents = require('electron').webContents.getFocusedWebContents()
  return await downloadSelf(
    progress => webContents.send('downloadProgress', progress),
    () => webContents.send('downloadState', true),
    () => {
      webContents.send('downloadState', false)
      webContents.send('canUpdate')
    },
  )
})

ipcMain.handle('install-update', async () => {
  return installSelf()
})

const {generateManifest, diffManifests} = require('./update/fileComparer')
const fs = require("fs");

ipcMain.handle('manifest-generate', async (event, directory) => {
  return await generateManifest(directory, {ignoredFiles: ['file.json'], ignoredExtensions: [], relativeResult: true})
})

ipcMain.handle('manifest-diff', async (event, oldManifest, newManifest) => {
  return await diffManifests(oldManifest, newManifest)
})

ipcMain.handle('download-app', async (event, app, filePath) => {
  const win = BrowserWindow.getFocusedWindow()
  const webContents = require('electron').webContents.getFocusedWebContents()
  const version = app.versions[0].version
  const baseUrl = `${app.rootPath}/${app.appCode}/${version}`
  const manifestUrl = `${baseUrl}/manifest.json`
  const response = await fetch(manifestUrl)
  const manifest = await response.json()
  // console.log(manifest)
  const totalSize = manifest.files.reduce((a, x) => a + x.fileSize, 0)
  console.log(totalSize)
  let downloaded = 0

  for (const manifestElement of manifest.files) {
    const url = `${baseUrl}/${manifestElement.filePath}`
    // console.log('Trying to download', url)
    const fullLocalPath = path.resolve(filePath, manifestElement.filePath)
    if (fs.existsSync(fullLocalPath)) {
      fs.unlinkSync(fullLocalPath)
    }

    await download(win, url, {
      directory: path.dirname(fullLocalPath),
      showBadge: false,
      onProgress: currentProgress => {
        currentProgress.totalBulkBytes = totalSize
        currentProgress.totalTransferredBytes = currentProgress.transferredBytes + downloaded
        currentProgress.totalPercent = currentProgress.totalTransferredBytes / currentProgress.totalBulkBytes * 100
        webContents.send('app-download-progress', currentProgress)
      },
      onTotalProgress: totalProgress => {
        // console.log('TOTAL PROGRESS', totalProgress)
      }
    })
    downloaded += manifestElement.fileSize
    // console.log(result)
  }

  console.log('downloaded')
})
