
const copyVolumeFiles = async (context) => {
  console.log('Copying volume files...')
  const fs = require('fs')
  const path = require('path')
  const origin = path.join(context.appOutDir, 'resources/app.asar.unpacked/node_modules/mwl-loudness/impl/windows/adjust_get_current_system_volume_vista_plus.exe')
  const target = path.join(context.appOutDir, 'resources/app.asar.unpacked/dist/main/adjust_get_current_system_volume_vista_plus.exe')
  if (!fs.existsSync(path.dirname(target))) {
    fs.mkdirSync(path.dirname(target), {recursive: true})
  }
  fs.copyFile(origin, target, console.log)
}

exports.default = copyVolumeFiles
