/* eslint-disable */
import {EventEmitter} from 'events'
import {BrowserWindow, app, Menu, Tray} from 'electron'
import Server from './server'
import path from 'path'

const DEV_SERVER_URL = process.env.DEV_SERVER_URL
const isProduction = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'
const windowStateKeeper = require('electron-window-state')

const Store = require('electron-store')

Store.initRenderer()

export default class BrowserWinHandler {
  /**
   * @param [options] {object} - browser window options
   * @param [allowRecreate] {boolean}
   */
  constructor(options, allowRecreate = true) {
    this._eventEmitter = new EventEmitter()
    this.allowRecreate = allowRecreate
    this.options = options
    this.browserWindow = null
    this._createInstance()
  }

  _createInstance() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    if (app.isReady()) {
      this._create()
    } else {
      app.once('ready', () => {
        this._create()
        this._createTray()
      })
    }

/*     app.on('window-all-closed', (event) => {
      event.preventDefault()
    }) */

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!this.allowRecreate) return
    app.on('activate', () => this._recreate())
  }

  _create() {
    let mainWindowState = windowStateKeeper({
      defaultWidth: 1920,
      defaultHeight: 1080
    })

    this.browserWindow = new BrowserWindow(
      {
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        fullscreen: mainWindowState.fullscreen,
        ...this.options,
        webPreferences: {
          ...this.options.webPreferences,
          webSecurity: false, // disable on dev to allow loading local resources
          nodeIntegration: true, // allow loading modules via the require () function
          contextIsolation: false, // https://github.com/electron/electron/issues/18037#issuecomment-806320028
        }
      })

    mainWindowState.manage(this.browserWindow)

    const mainWindow = this.browserWindow

    this.browserWindow.on('close', function (event) {
      console.log('close')
      console.log('app.isQuiting', app.isQuiting)
      if (!app.isQuiting) {
        event.preventDefault()
        mainWindow.hide()
      }
      return false
    })

    this.browserWindow.on('closed', () => {
      // Dereference the window object
      this.browserWindow = null
    })
    this._eventEmitter.emit('created')

    const serverInstance = new Server(this.browserWindow)
    serverInstance.startServer()
  }

  _recreate() {
    if (this.browserWindow === null) this._create()
  }

  /**
   * @callback onReadyCallback
   * @param {BrowserWindow}
   */

  /**
   *
   * @param callback {onReadyCallback}
   */
  onCreated(callback) {
    if (this.browserWindow !== null) return callback(this.browserWindow)
    this._eventEmitter.once('created', () => {
      callback(this.browserWindow)
    })
  }

  async loadPage(pagePath) {
    if (!this.browserWindow) return Promise.reject(new Error('The page could not be loaded before win \'created\' event'))
    const serverUrl = isDev ? DEV_SERVER_URL : 'app://./index.html'
    const fullPath = serverUrl + '#' + pagePath
    await this.browserWindow.loadURL(fullPath)
  }

  /**
   *
   * @returns {Promise<BrowserWindow>}
   */
  created() {
    return new Promise(resolve => {
      this.onCreated(() => resolve(this.browserWindow))
    })
  }

  _createTray() {
    const isDev = process.env.NODE_ENV === 'development'
    console.log("isDev: ", isDev)
    let image
    if (isDev) {
      image = path.join(__dirname, '../extraResources', 'media', 'icon.png');
    }else{
      const dir = path.dirname(app.getPath("exe"));
      image = path.join(dir, 'resources', 'media', 'icon.png');
    }
    this.tray = new Tray(image)

    const mainWindow = this.browserWindow

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: function () {
          mainWindow.show()
        }
      },
      {
        label: 'Quit',
        click: function () {
          app.isQuiting = true
          app.quit()
        }
      }
    ])

    this.tray.setToolTip('Kharon launcher')
    this.tray.setContextMenu(contextMenu)

    this.tray.on('click', function () {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
  }
}
