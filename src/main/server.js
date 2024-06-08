import {execSync} from 'child_process'
import express from 'express'
import bodyParser from 'body-parser'
import {BrowserWindow, ipcMain} from 'electron'

const PORTS = [4000, 4001, 4002]

export default class Server {
  constructor(window) {
    this.window = window
    this.launcherApp = express()
    this.launcherApp.use(bodyParser.json())

    this.launcherApp.get('/app-list', (_, res) => {
      ipcMain.once('get-app-list-return', async (_, apps) => {
        console.log('APPS', apps)
        res.send(apps)
      })
      this.sendToRenderer('get-app-list')
    })

    this.launcherApp.post('/launch-app', (req, res) => {
      const {appId} = req.body
      this.launchApp(appId)
        .then(() => res.send('App started successfully'))
        .catch(_ => res.status(500).send('Failed to start app'))
    })
  }

  sendToRenderer(channel, ...args) {
    this.window.webContents.send(channel, ...args)
  }

  launchApp(appId) {
    return new Promise((resolve, reject) => {
      ipcMain.once('launch-app-return', (_, result, error) => {
        if (result) {
          resolve()
        } else {
          reject(error)
        }
      })
      this.sendToRenderer('launch-app', appId)
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
