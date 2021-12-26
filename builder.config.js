const path = require('path')
const ICONS_DIR = 'build/icons/'

require('dotenv').config()

const windowsOS = {
  win: {
    icon: path.join(ICONS_DIR, 'win', 'icon.ico'),
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
        publisherName: [],
        verifyUpdateCodeSignature: false
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
    icon: path.join(ICONS_DIR, 'png/'),
    target: 'deb'
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const macOS = {
  mac: {
    target: 'dmg',
    icon: path.join(ICONS_DIR, 'mac', 'icon.icns'),
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
  productName: 'Kharon',
  appId: 'com.kharon.client',
  // eslint-disable-next-line no-template-curly-in-string
  artifactName: 'setup-${version}.${ext}',
  afterPack: '.electron-nuxt/remove-publishers.js',
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
