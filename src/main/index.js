const path = require('path')
const childProcess = require('child_process')
const fs = require('fs-extra')
const originalFs = require('original-fs')
const {
  app,
  ipcMain,
  BrowserWindow,
  dialog,
  shell
} = require('electron')
const {download} = require('electron-dl')
const fetch = require('electron-fetch').default
const isDev = require('electron-is-dev')
const ftp = require('basic-ftp')
const {
  checkForUpdatesSelf,
  downloadSelf,
  installSelf
} = require('./update/selfUpdater')

/**
 *
 * @param channel
 * @param args
 */
function sendToRenderer(channel, ...args) {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win) return

  win.webContents.send(channel, ...args)
}

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
  return await dialog.showOpenDialog({properties: ['openDirectory']})
})

ipcMain.handle('upload-ftp', async (event, params) => {
  console.log('starting ftp with params', params)

  const appCode = params.appCode
  const version = params.version
  const ftpPath = params.ftpPath
  const manifest = params.manifest
  const selectedPath = params.selectedPath
  const asarFiles = []

  const client = new ftp.Client()
  client.ftp.verbose = true
  let isSuccess = false

  try {
    await client.access({
      host: params.host,
      user: params.user,
      password: params.password,
      secure: false
    })
    console.log(await client.list(ftpPath))
    console.log('FTP PATH', ftpPath)
    const remoteDirPath = '/' + [ftpPath, appCode, version.toString()].join('/')
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
      let from = path.join(selectedPath, manifestElement.filePath)
      const ext = path.extname(from)
      if (ext === '.asar') {
        originalFs.copyFileSync(from, from + '.asar_tmp')
        from = from + '.asar_tmp'
        asarFiles.push(from)
      }
      const to = [remoteDirPath, manifestElement.filePath].join('/').replace(/\\/g, '/')
      const toDir = path.dirname(to)
      console.log(manifestElement, from, to, toDir)

      try {
        await client.ensureDir(toDir)

        await client.uploadFrom(from, to)
        console.log(`UPDATED ${i + 1} from ${manifestLength}`)
        uploadedBytes += manifestElement.fileSize
        sendToRenderer('ftp-uploaded', {
          count: i + 1,
          totalCount: manifestLength,
          bytes: uploadedBytes,
          totalBytes,
          percent: (uploadedBytes / totalBytes) * 100,
          currentFilePath: manifestElement.filePath,
          currentFileSize: manifestElement.fileSize
        })
      } catch (uploadError) {
        console.error(`Failed to upload ${from} to ${to}`, uploadError)
        throw uploadError
      }
    }

    isSuccess = true
  } catch (err) {
    console.log('UPLOAD ERROR', err)
    dialog.showErrorBox('FTP Upload Error', err.message)
  } finally {
    client.close()
    for (const asarFile of asarFiles) {
      originalFs.unlinkSync(asarFile)
    }
  }

  return isSuccess
})

ipcMain.handle('get-version', () => app.getVersion())

ipcMain.handle('check-update', async () => {
  return await checkForUpdatesSelf(
    result => console.log('Fetched with result', result))
})

ipcMain.handle('download-update', async () => {
  return await downloadSelf(
    progress => sendToRenderer('downloadProgress', progress),
    () => sendToRenderer('downloadState', true),
    () => {
      sendToRenderer('downloadState', false)
      sendToRenderer('canUpdate')
    },
  )
})

ipcMain.handle('install-update', async () => {
  return installSelf()
})

const {
  generateManifest,
  diffManifests
} = require('./update/fileComparer')

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
    originalFs.writeFileSync(savePath, JSON.stringify(manifest))
    originalFs.writeFileSync(path.join(dirname, 'diff.json'), JSON.stringify(diff))
  }
  return manifest
})

ipcMain.handle('manifest-diff', async (event, oldManifest, newManifest) => {
  return await diffManifests(oldManifest, newManifest)
})

/**
 * @param event
 * @param {KharonApp} kharonApp
 */
ipcMain.handle('close', (event, kharonApp) => {
  const appExePath = kharonApp.exePath
  const appExeName = path.basename(appExePath)
  const result = childProcess.execSync(`taskkill /IM ${appExeName} /F`).toString()
  console.log(`App ${appExeName} closed with result: ${result}`)
  return result
})

ipcMain.handle('launch',
  /**
   *
   * @param event
   * @param {KharonApp} kharonApp
   * @param {string} appPath
   * @param {string} errorTitle
   * @param {string} errorText
   * @return {Promise<void>}
   */
  async (event, kharonApp, appPath, errorTitle, errorText) => {
    const exePath = path.join(appPath, kharonApp.exePath)
    if (!originalFs.existsSync(exePath)) {
      dialog.showErrorBox(errorTitle, `${exePath}: ${errorText}`)
    }
    console.log('LAUNCHING', exePath)
    childProcess.execFile(exePath)
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
    if (!originalFs.existsSync(shortcut)) {
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
  const win = BrowserWindow.getAllWindows()[0]

  console.log(manifest)

  let filesForDownload = null

  if (diff) {
    for (const movedFile of diff.movedFiles) {
      const from = path.resolve(filePath, movedFile.from.filePath)
      for (const toElement of movedFile.to) {
        const to = path.resolve(filePath, toElement)
        const dir = path.dirname(to)
        fs.ensureDirSync(dir)
        originalFs.copyFileSync(from, to)
      }
      originalFs.unlinkSync(from)
    }
    for (const missingFile of diff.missingFiles) {
      const from = path.resolve(filePath, missingFile.filePath)
      originalFs.unlinkSync(from)
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
    if (originalFs.existsSync(fullLocalPath)) {
      originalFs.unlinkSync(fullLocalPath)
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
        sendToRenderer('app-download-progress', currentProgress)
      },
    })
    if (fullLocalPath.endsWith('.asar.asar_tmp')) {
      const newName = fullLocalPath.replace('.asar.asar_tmp', '.asar')
      originalFs.renameSync(fullLocalPath, newName)
    }
    downloaded += manifestElement.fileSize
  }
})
