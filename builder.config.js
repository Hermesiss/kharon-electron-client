const ICONS_DIR = 'build/icons/'

require('dotenv').config()

const windowsOS = {
  win: {
    icon: ICONS_DIR + 'win-icon.ico',
    publisherName: 'hermesis',
    target: 'nsis',
    requestedExecutionLevel: 'highestAvailable',
    publish: [
      {
        provider: 'github',
        repo: 'kharon-electron-client',
        owner: 'hermesiss',
        private: false,
        releaseType: 'release',
        token: process.env.GH_TOKEN,
        publisherName: ['hermesiss']
      }
    ]
  },

  nsis: {
    differentialPackage: true
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const linuxOS = {
  linux: {
    icon: ICONS_DIR,
    target: 'deb'
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const macOS = {
  mac: {
    target: 'dmg',
    icon: ICONS_DIR + 'con.icns'
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ]
  }
}

module.exports = {
  productName: 'kharon-electron-client',
  appId: 'com.kharon.client',
  artifactName: 'setup-${version}.${ext}',
  directories: {
    output: 'dist/publish'
  },
  // default files: https://www.electron.build/configuration/contents
  files: [
    'package.json',
    {
      from: 'dist/main/',
      to: 'dist/main/'
    },
    {
      from: 'dist/renderer',
      to: 'dist/renderer/'
    }
  ],
  extraResources: [
    {
      from: 'src/extraResources/',
      to: ''
    }
  ],
  ...windowsOS,
  // ...linuxOS,
  // ...macOS
}
