import {BrowserWindow} from 'electron'

/**
 *
 * @param channel
 * @param args
 */
export function sendToRenderer(channel, ...args) {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win) return

  win.webContents.send(channel, ...args)
}
