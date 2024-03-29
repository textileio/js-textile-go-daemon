'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import { DaemonFactory } from '@textile/go-daemon'

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  const window = new BrowserWindow({webPreferences: {nodeIntegration: true}})

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})

ipcMain.on('start', ({ sender }) => {
  console.log('starting disposable Textile')
  sender.send('message', 'starting disposable Textile')

  const df = new DaemonFactory()
  df.spawn({ disposable: true })
    .then(daemon => {
      console.log('get profile')
      sender.send('message', 'get profile')
      daemon.api.profile.get().then(profile => {
        console.log('got profile address', profile.address)
        sender.send('message', JSON.stringify(profile, undefined, 2))
        daemon.stop()
      })
        .catch(err => {
          sender.send('error', err.toString())
        })
    })
    .catch(err => {
      sender.send('error', err.toString())
    })
})
