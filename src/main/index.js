const path = require('path')
const child_process = require('child_process')
const fs = require('fs-extra')
const {app, ipcMain, BrowserWindow, dialog, shell} = require('electron')
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
    await client.clearWorkingDir()
    const actualFiles = manifest.files.filter(x => x.version === version)
    actualFiles.push({
      filePath: 'manifest.json',
      fileSize: 10000
    })
    const totalBytes = actualFiles.reduce((a, x) => a + x.fileSize, 0)
    let uploadedBytes = 0
    const manifestLength = actualFiles.length
    for (let i = 0; i < manifestLength; i++) {
      const manifestElement = actualFiles[i]
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

ipcMain.handle('manifest-generate', async (event, directory, savePath, oldManifest, newVersion) => {
  const manifest = await generateManifest(directory, {
    ignoredFiles: ['manifest.json', 'diff.json'],
    ignoredExtensions: [],
    relativeResult: true
  })
  let diff = null
  if (oldManifest) {
    diff = await diffManifests(oldManifest, manifest)
  }

  for (let i = 0; i < manifest.files.length; i++) {
    const file = manifest.files[i]
    if (diff) {
      const fromOldManifest = oldManifest.files.find(x => x.filePath === file.filePath)
      console.log(fromOldManifest)
      if (fromOldManifest && fromOldManifest.version) {
        if (diff.newFiles.some(x => x.filePath === file.filePath) ||
          diff.changedFiles.some(x => x.filePath === file.filePath) ||
          diff.movedFiles.some(x => x.to.includes(file.filePath))) {
          manifest.files[i].version = newVersion
        } else {
          manifest.files[i].version = fromOldManifest.version
        }
        continue
      }
    }
    manifest.files[i].version = newVersion
  }

  if (savePath) {
    const dirname = path.dirname(savePath)
    console.log('DIRNAME', dirname)
    fs.ensureDirSync(dirname)
    fs.writeFileSync(savePath, JSON.stringify(manifest))
    fs.writeFileSync(path.join(dirname, 'diff.json'), JSON.stringify(diff))
  }
  return manifest
})

ipcMain.handle('manifest-diff', async (event, oldManifest, newManifest) => {
  return await diffManifests(oldManifest, newManifest)
})

ipcMain.handle('launch',
  /**
   *
   * @param event
   * @param {KharonApp} kharonApp
   * @param {string} appPath
   * @return {Promise<void>}
   */
  async (event, kharonApp, appPath) => {
    const exePath = path.join(appPath, kharonApp.exePath)
    console.log('LAUNCHING', exePath)
    child_process.execFile(exePath);
  })

ipcMain.handle('shortcuts-create',
  /**
   *
   * @param event
   * @param {KharonApp} kharonApp
   * @param {string} appPath
   * @return {Promise<void>}
   */
  async (event, kharonApp, appPath) => {
    const shortcut = path.join(app.getPath('home'), 'Desktop', `${kharonApp.appName}.lnk`)
    const exePath = path.join(appPath, kharonApp.exePath)
    console.log('CREATING SHORTCUTS', shortcut, exePath)
    const res = shell.writeShortcutLink(shortcut, {
      target: exePath,
      icon: exePath,
      iconIndex: 0
    })
  })

ipcMain.handle('shortcuts-delete',
  /**
   *
   * @param event
   * @param {KharonApp} kharonApp
   * @param {string} appPath
   * @return {Promise<void>}
   */
  async (event, kharonApp, appPath) => {
    const shortcut = path.join(app.getPath('home'), 'Desktop', `${kharonApp.appName}.lnk`)
    if (!fs.existsSync(shortcut)) {
      console.log('SHORTCUT', shortcut, 'not exists, cannot delete')
      return
    }

    console.log('DELETING SHORTCUTS', shortcut)
    const res = shell.trashItem(shortcut)
  })

ipcMain.handle('debug', async () => {
  const win = BrowserWindow.getFocusedWindow()
  win.webContents.openDevTools()
})

ipcMain.handle('download-app', async (event, manifest, app, filePath, diff) => {
  const win = BrowserWindow.getFocusedWindow()
  const webContents = require('electron').webContents.getFocusedWebContents()

  console.log(manifest)

  let filesForDownload = null

  if (diff) {
    for (const movedFile of diff.movedFiles) {
      const from = path.resolve(filePath, movedFile.from.filePath)
      for (const toElement of movedFile.to) {
        const to = path.resolve(filePath, toElement)
        const dir = path.dirname(to)
        fs.ensureDirSync(dir)
        fs.copyFileSync(from, to)
      }
      fs.unlinkSync(from)
    }
    for (const missingFile of diff.missingFiles) {
      const from = path.resolve(filePath, missingFile.filePath)
      fs.unlinkSync(from)
    }
    filesForDownload = manifest.files.filter(x => diff.newFiles.some(z => z.filePath === x.filePath) ||
      diff.changedFiles.some(z => z.filePath === x.filePath)
    )
  } else {
    filesForDownload = manifest.files
  }

  const totalSize = filesForDownload.reduce((a, x) => a + x.fileSize, 0)
  let fileCount = 0
  let downloaded = 0

  for (const manifestElement of filesForDownload) {
    fileCount++
    console.log(manifestElement)
    const version = manifestElement.version
    const baseUrl = `${app.rootPath}/${app.appCode}/${version}`
    const url = `${baseUrl}/${manifestElement.filePath}`
    const fullLocalPath = path.resolve(filePath, manifestElement.filePath)
    if (fs.existsSync(fullLocalPath)) {
      fs.unlinkSync(fullLocalPath)
    }

    console.log(`Downloading from ${url}`)
    await download(win, url, {
      directory: path.dirname(fullLocalPath),
      showBadge: false,
      onProgress: currentProgress => {
        currentProgress.totalBytes = totalSize
        currentProgress.bytes = currentProgress.transferredBytes + downloaded
        currentProgress.percent = currentProgress.bytes / currentProgress.totalBytes * 100
        currentProgress.count = fileCount
        currentProgress.totalCount = filesForDownload.length
        currentProgress.currentFileSize = manifestElement.fileSize
        currentProgress.currentFilePath = manifestElement.filePath
        webContents.send('app-download-progress', currentProgress)
      },
    })
    downloaded += manifestElement.fileSize
  }
})
