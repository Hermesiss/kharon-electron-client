const fs = require('fs')
const path = require('path')
const md5File = require('md5-file')

const generateManifest = async (rootPath,
                                settings = {
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
      movedFiles.push({from: missingFile, to: newWithHash})
    }
  }

  newFiles = newFiles.filter(x => !movedFiles.some(m => x.hash === m.from.hash))
  missingFiles = missingFiles.filter(x => !movedFiles.some(m => x.hash === m.from.hash))

  for (let i = 0; i < changedFiles.length; i++) {
    changedFiles[i] = newManifestFiles.find(x => x.filePath === changedFiles[i].filePath)
  }

  return {newFiles, missingFiles, changedFiles, movedFiles}
}

const getAllFiles = async (dirPath, rootDir, settings, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  for (const file of files) {
    const stats = fs.statSync(`${dirPath}/${file}`)
    if (settings.ignoredFiles.some(x => file.startsWith(x))) continue

    if (stats.isDirectory()) {
      arrayOfFiles = await getAllFiles(`${dirPath}/${file}`, rootDir, settings, arrayOfFiles)
    } else {
      let filePath = path.join(dirPath, '/', file)

      const ext = filePath.split('.').pop()

      if (settings.ignoredExtensions.includes(ext)) continue

      const hash = await md5File(filePath)
      const fileSize = stats.size

      if (rootDir) {
        filePath = path.relative(rootDir, filePath)
      }

      filePath = extToLowercase(filePath)

      arrayOfFiles.push({filePath, hash, fileSize})
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

module.exports = {generateManifest, diffManifests}
