const path = require('path')
const crypto = require('crypto')
const originalFs = require('original-fs')
const {dialog} = require('electron')

/**
 * Our own implementation of md5File that uses original-fs instead of fs (because of .asar)
 * https://www.electronjs.org/docs/latest/tutorial/asar-archives
 * @param filePath
 * @return {Promise<unknown>}
 */
function md5File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5')
    const stream = originalFs.createReadStream(filePath)

    stream.on('data', data => {
      hash.update(data, 'utf8')
    })

    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })

    stream.on('error', err => {
      reject(err)
    })
  })
}

const generateManifest = async (rootPath, settings = {
  ignoredFiles: [],
  ignoredExtensions: [],
  relativeResult: false
}) => {
  const files = await getAllFiles(rootPath, settings.relativeResult ? rootPath : null, settings)
  return {files}
}

const diffManifests = async (oldManifest, newManifest) => {
  oldManifest = JSON.parse(JSON.stringify(oldManifest))
  newManifest = JSON.parse(JSON.stringify(newManifest))
  const oldManifestFiles = oldManifest.files
  const newManifestFiles = newManifest.files
  let newFiles = newManifestFiles.filter(newFile =>
    !oldManifestFiles.some(oldFile => oldFile.filePath === newFile.filePath))
  let missingFiles = oldManifestFiles.filter(oldFile =>
    !newManifestFiles.some(newFile => newFile.filePath === oldFile.filePath))
  const changedFiles = oldManifestFiles.filter(oldFile => {
    if (missingFiles.some(x => x.filePath === oldFile.filePath)) return false
    return !newManifestFiles.some(newFile => newFile.filePath === oldFile.filePath &&
      newFile.hash === oldFile.hash)
  })

  const movedFiles = []

  for (const missingFile of missingFiles) {
    const hash = missingFile.hash
    const newWithHash = newFiles.filter(x => x.hash === hash).map(x => x.filePath)
    if (newWithHash.length > 0) {
      movedFiles.push({
        from: missingFile,
        to: newWithHash
      })
    }
  }

  newFiles = newFiles.filter(x => !movedFiles.some(m => x.hash === m.from.hash))
  missingFiles = missingFiles.filter(x => !movedFiles.some(m => x.hash === m.from.hash))

  for (let i = 0; i < changedFiles.length; i++) {
    changedFiles[i] = newManifestFiles.find(x => x.filePath === changedFiles[i].filePath)
  }

  return {
    newFiles,
    missingFiles,
    changedFiles,
    movedFiles
  }
}

const getAllFiles = async (dirPath, rootDir, settings, arrayOfFiles) => {
  const files = originalFs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  for (const file of files) {
    let filePath = `${dirPath}/${file}`
    const stats = originalFs.statSync(filePath)
    if (settings.ignoredFiles.some(x => file.startsWith(x))) continue

    if (stats.isDirectory()) {
      arrayOfFiles = await getAllFiles(filePath, rootDir, settings, arrayOfFiles)
    } else {
      const ext = filePath.split('.').pop()

      if (ext === '.asar_tmp') continue

      if (settings.ignoredExtensions.includes(ext)) continue
      try {
        const hash = await md5File(filePath)
        const fileSize = stats.size

        if (rootDir) {
          filePath = path.relative(rootDir, filePath)
        }

        filePath = extToLowercase(filePath)

        arrayOfFiles.push({
          filePath,
          hash,
          fileSize
        })
      } catch (e) {
        console.error(e)
        dialog.showErrorBox('Error', e.message)
        throw e
      }
    }
  }

  return arrayOfFiles
}

const extToLowercase = filePath => {
  const pos = filePath.lastIndexOf('.')

  if (pos >= 0) {
    const ext = filePath.split('.').pop().toLowerCase()
    filePath = filePath.substr(0, pos < 0 ? filePath.length : pos) + '.' + ext
  }

  return filePath
}

module.exports = {
  generateManifest,
  diffManifests
}
