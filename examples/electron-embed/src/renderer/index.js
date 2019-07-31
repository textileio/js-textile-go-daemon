'use strict'
const { ipcRenderer } = require('electron')

// Simple function to append pre tags
function appendPre (data) {
  const pre = document.createElement('pre')
  console.log(data)
  pre.textContent = data
  document.body.appendChild(pre)
}

// Prepare handle messages
ipcRenderer.on('message', (event, msg) => appendPre(msg))
ipcRenderer.on('error', (event, err) => appendPre(err))

// Create and hook up button
const button = document.createElement('button')
button.innerHTML = 'test textile app'
document.body.appendChild(button)
document.querySelector('button')
  .addEventListener('click', () => {
    ipcRenderer.once('profile', (event, id) => appendPre(id))
    ipcRenderer.send('start')
  })
