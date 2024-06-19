import express from 'express'
import bodyParser from 'body-parser'
import {BrowserWindow, ipcMain} from 'electron'

const PORTS = [4000, 4001, 4002]

export default class Server {
  async closeAllApps() {
    for (const [appId, {type}] of this.launchedApps) {
      if (type === 'app') {
        await this.closeApp(appId)
      } else if (type === 'website') {
        await this.closeWebsite()
      }
    }
    this.launchedApps.clear()
  }

  constructor(window) {
    this.window = window
    /** @type {Electron.BrowserWindow | null} */
    this.websiteWindow = null
    this.launcherApp = express()
    this.launcherApp.use(bodyParser.json())
    /** @type {Map<string,{type: 'app'|'website'}>} */
    this.launchedApps = new Map()

    this.launcherApp.get('/api/app-list', (_, res) => {
      ipcMain.once('get-app-list-return', async (_, apps) => {
        res.send(apps)
      })
      this.sendToRenderer('get-app-list')
    })

    this.launcherApp.post('/api/app-launch', (req, res) => {
      const {appId} = req.body
      this.launchApp(appId)
        .then(() => res.send('App started successfully'))
        .catch(err => {
          return res.status(500).send(`${err}`)
        })
    })

    this.launcherApp.post('/api/app-close', (req, res) => {
      const {appId} = req.body
      this.closeApp(appId)
        .then(() => res.send('App closed successfully'))
        .catch(err => {
          return res.status(500).send(`${err}`)
        })
    })

    this.launcherApp.post('/api/website-launch', (req, res) => {
      const {
        website,
        zoomFactor
      } = req.body
      this.launchWebsite(website, zoomFactor).then(
        () => res.send('Website launched successfully'),
        err => res.status(500).send(`${err}`)
      )
    })

    this.launcherApp.post('/api/website-close', (req, res) => {
      this.closeWebsite().then(
        () => res.send('Website closed successfully'),
        err => res.status(500).send(`${err}`))
    })

    this.launcherApp.post('/api/close-all', (req, res) => {
      console.log('Closing all apps')
      this.closeAllApps().then(
        () => res.send('All apps closed successfully'),
        err => res.status(500).send(`${err}`))
    })
  }

  sendToRenderer(channel, ...args) {
    this.window.webContents.send(channel, ...args)
  }

  async launchWebsite(website, zoom = 1) {
    if (this.launchedApps.size > 0) {
      await this.closeAllApps()
    }
    this.websiteWindow = new BrowserWindow({
      fullscreen: true,
      kiosk: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false
      }
    })
    console.log(`Launching website ${website} with zoom factor ${zoom}`)
    this.websiteWindow.webContents.setZoomFactor(zoom)
    this.launchedApps.set(website, {type: 'website'})
    await this.websiteWindow.loadURL(website)
  }

  async closeWebsite() {
    if (this.websiteWindow) {
      this.websiteWindow.close()
      this.websiteWindow = null
    }
  }

  async launchApp(appId) {
    if (this.launchedApps.size > 0) {
      await this.closeAllApps()
    }
    const server = this
    return new Promise((resolve, reject) => {
      ipcMain.once('launch-app-return', (_, result, error) => {
        if (result) {
          server.launchedApps.set(appId, {type: 'app'})
          resolve()
        } else {
          reject(error)
        }
      })
      this.sendToRenderer('launch-app', appId)
    })
  }

  closeApp(appId) {
    const server = this
    return new Promise((resolve, reject) => {
      ipcMain.once('close-app-return', (_, result, error) => {
        if (result) {
          server.launchedApps.delete(appId)
          resolve()
        } else {
          reject(error)
        }
      })
      this.sendToRenderer('close-app', appId)
    })
  }

  startServer(portIndex = 0) {
    if (portIndex >= PORTS.length) {
      console.error('No available ports')
      return
    }

    const port = PORTS[portIndex]
    this.launcherApp.listen(port, err => {
      if (err) {
        console.error(`Port ${port} is already in use, trying next port...`)
        this.startServer(portIndex + 1)
      } else {
        console.log(`Launcher is running on port ${port}`)
        setInterval(() => {
          this.sendToRenderer('set-port', port)
          this.sendToRenderer('register-computer')
        }, 1000 * 10)
      }
    })
  }
}
