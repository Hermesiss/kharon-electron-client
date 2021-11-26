const path = require('path')
const fs = require('fs-extra')
const {app, ipcMain, BrowserWindow, dialog} = require('electron')
const {download} = require('electron-dl')
const fetch = require('electron-fetch').default
const isDev = require('electron-is-dev')
const ftp = require('basic-ftp')
const {checkForUpdatesSelf, downloadSelf, installSelf} = require('./update/selfUpdater')

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('browser-window-created', (event, win) => {
  console.log('WINDOW CREATED', event, win)
  if (!isDev) win.removeMenu()
})

// Load here all startup windows
require('./mainWindow')

ipcMain.handle('get-folder', async () => {
  const result = await dialog.showOpenDialog({properties: ['openDirectory']})
  return result
})

ipcMain.handle('upload-ftp', async (event, params) => {
  console.log('starting ftp with params', params)
  const webContents = require('electron').webContents.getFocusedWebContents()
  const appCode = params.appCode
  const version = params.version
  const ftpPath = params.ftpPath
  const manifest = params.manifest
  const selectedPath = params.selectedPath

  const client = new ftp.Client()
  client.ftp.verbose = true
  let isSuccess = false

  const totalBytes = manifest.files.reduce((a, x) => a + x.fileSize, 0)
  let uploadedBytes = 0

  try {
    const result = await client.access({
      host: params.host,
      user: params.user,
      password: params.password,
      secure: false
    })
    console.log(await client.list(ftpPath))
    console.log('FTP PATH', ftpPath)
    const remoteDirPath = [ftpPath, appCode, version.toString()].join('/')
    console.log('REMOTE PATH', remoteDirPath)
    await client.ensureDir(remoteDirPath)

    const manifestLength = manifest.files.length
    for (let i = 0; i < manifestLength; i++) {
      const manifestElement = manifest.files[i]
      const from = path.join(selectedPath, manifestElement.filePath)
      const to = [remoteDirPath, manifestElement.filePath].join('/').replaceAll('\\', '/')
      const toDir = path.dirname(to)
      console.log(manifestElement, from, to, toDir)
      await client.ensureDir(toDir)
      await client.uploadFrom(from, to)
      console.log(`UPDATED ${i + 1} from ${manifestLength}`)
      uploadedBytes += manifestElement.fileSize
      webContents.send('ftp-uploaded', {
        count: i + 1,
        totalCount: manifestLength,
        bytes: uploadedBytes,
        totalBytes,
        percent: uploadedBytes / totalBytes * 100,
        currentFilePath: manifestElement.filePath,
        currentFileSize: manifestElement.fileSize
      })
    }

    isSuccess = true
  } catch (err) {
    console.log(err)
  }
  client.close()
  return isSuccess
})

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

ipcMain.handle('manifest-generate', async (event, directory, savePath) => {
  const manifest = await generateManifest(directory, {
    ignoredFiles: ['file.json'],
    ignoredExtensions: [],
    relativeResult: true
  })
  if (savePath) {
    const dirname = path.dirname(savePath)
    console.log('DIRNAME', dirname)
    fs.ensureDirSync(dirname)
    fs.writeFileSync(savePath, JSON.stringify(manifest))
  }
  return manifest
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
  const totalSize = manifest.files.reduce((a, x) => a + x.fileSize, 0)
  let downloaded = 0

  for (const manifestElement of manifest.files) {
    const url = `${baseUrl}/${manifestElement.filePath}`
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
    })
    downloaded += manifestElement.fileSize
  }
})
