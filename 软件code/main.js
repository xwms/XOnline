const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu, } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const fs = require("fs")
const os = require("os")
const axios = require('axios')
const cp = require('child_process')
const log = require('electron-log')
var express = require('express')
var service = express()
let appTray = null
let win
var roaming = path.join(os.homedir(),'AppData/Roaming/XOnline')
log.transports.file.resolvePath = () => path.join(roaming,'cache/log/app.log')
const json_path = {
  folder:[
    roaming,// 0
    path.join(roaming,'lib'),// 1
    path.join(roaming,'cache'), // 2
    path.join(roaming,'cache/log'),// 3
    path.join(roaming,'cache/user'),// 4
    path.join(roaming,'cfg'),// 5
    path.join(roaming,'cfg/background'),// 6
    path.join(roaming,'cfg/import') // 7
  ],
  files:[
    path.join(roaming,'cache/log/app.log'),// 0
    path.join(roaming,'cache/log/connect.log'),// 1
    path.join(roaming,'cache/user/history.json'),// 2
    path.join(roaming,'cfg/import/appset.json'),// 3
    path.join(roaming,'cfg/import/connectconfig.ini'),// 4
  ],
  exeFiles:[
    path.join(roaming,'lib/frpc.exe')
  ]
}
const appset = {
  "themeColor":"#cbccd4",
  "title":{
    "titleText":"",
    "titleTextColor":"#666"
  },
    "background":{
      "picture":[],
      "autochange":false,
      "interval":"5"
    },
    "startup":false
  }
service.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})
service.use('/local', express.static(path.resolve()))
service.use('/cfg', express.static(json_path.folder[5]))
service.use('/cache', express.static(json_path.folder[2]))
function createWindow () {
  win = new BrowserWindow({
    width: 1024,
    minWidth: 1024,
    height: 576,
    minHeight: 576,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadFile('./new/XOnline.html')
  win.webContents.openDevTools()
  ipcMain.on('min', () => {
    win.minimize()
  })
}
function isFileExisted(filePath) {
    fs.access(filePath, (err) => {
      if (err) {
        fs.appendFileSync(filePath,'','utf-8', (err) => {
          log.error(err)
        })
      }
    })
  }
function check () {
  for(num in json_path.folder) {
    if(!fs.existsSync(json_path.folder[num])) {
      fs.mkdirSync(json_path.folder[num])
    }
  }
  for(num in json_path.files) {
    isFileExisted(json_path.files[num])
  }
  fs.access(json_path.exeFiles[0], (err) => {
    if (err) {
      downloadFile('http://175.178.57.88/frpc/frpc.exe',json_path.exeFiles[0])
    }
  })
  fs.access(json_path.files[3], (err) => {
    if (err) {
      fs.writeFile(json_path.files[3],JSON.stringify(appset),(err)=>{
        if(err){
          log.error(err)
        }
      })
    }
  })
  fs.writeFile(json_path.files[4], '', (err) => {
    if(err){
      log.error(err)
    }
  })
  fs.writeFile(json_path.files[2],'',(err) => {
    if(err){
      log.error(err)
    }
  })
}
function tray() {
  appTray = new Tray(path.join(__dirname,'au5vl-79adv-001.ico'))
  appTray.setToolTip('XOnline')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示面板',
      click: () => {
        win.show()
      }
    },
    {
      label: '退出程序',
      click: () => {
        app_quit()
      }
    }
  ])
  appTray.setContextMenu(contextMenu)
  appTray.on('click', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }else{
      win.isVisible() ? win.hide() : win.show()
    }
  })
}
app.whenReady().then(() => {
  check()
  service.listen(5656)
  createWindow()
  tray()
  setTimeout(() => {
    updater('http://175.178.57.88/version/releases/')
  },3000)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})
ipcMain.on('start-frp', (err,data) => {
    switch(data.type){
        case "c":
            var con_created = '[common]'
            +'\n'
            +'server_addr = cloud.dislite.top'
            +'\n'
            +'server_port = 7000'
            +'\n'
            +'log_file = C:/Users/'+os.userInfo().username+'/AppData/Roaming/XOnline/cache/log/connect.log'
            +'\n'
            +'log_level = info'
            +'\n'
            +'log_max_days = 1'
            +'\n'
            +'\n'
            +'['+data.data.code.split('&')[0]
            +']'
            +'\n'+'type = stcp'
            +'\n'
            +'sk = '+data.data.code.split('&')[1]
            +'\n'
            +'local_ip = 127.0.0.1'
            +'\n'
            +'local_port = '+data.data.port
            +'\n'
            +'use_encryption = true'
            +'\n'
            +'use_compression = true'
            fs.writeFile(json_path.files[4],con_created,(err) => {
              if(err){
                log.error(err)
              }
            })
            fs.writeFile(json_path.files[2],JSON.stringify(data.data),(err) => {
              if(err){
                log.error(err)
              }
            })
            cp.exec(json_path.exeFiles[0]+' -c '+json_path.files[4],() => {})
            break
        case "j":
            var con_join = '[common]'
            +'\n'
            +'server_addr = cloud.dislite.top'
            +'\n'
            +'server_port = 7000'
            +'\n'
            +'log_file = C:/Users/'+os.userInfo().username+'/AppData/Roaming/XOnline/cache/log/connect.log'
            +'\n'
            +'log_level = info'
            +'\n'
            +'log_max_days = 1'
            +'\n'
            +'\n'
            +'[con_visitor]'
            +'\n'
            +'type = stcp'
            +'\n'
            +'role = visitor'
            +'\n'
            +'server_name = '+data.data.code.split('&')[0]
            +'\n'
            +'sk = '+data.data.code.split('&')[1]
            +'\n'
            +'bind_addr = 127.0.0.1'
            +'\n'
            +'bind_port = 26150'
            fs.writeFile(json_path.files[4],con_join,(err) => {
              if(err){
                log.error(err)
              }
            })
            fs.writeFile(json_path.files[2],JSON.stringify(data.data),(err) => {
              if(err){
                log.error(err)
              }
            })
            cp.exec(json_path.exeFiles[0]+' -c '+json_path.files[4],() => {})
            break
    }
})
ipcMain.on('refresh', (err,data) => {
  var readDir = fs.readdirSync(json_path.folder[6])
  var setConfig = fs.readFileSync(json_path.files[3],"utf-8")
  var jsonObject = JSON.parse(setConfig)
  jsonObject.themeColor = data.themeColor
  jsonObject.title.titleText = data.title.titleText
  jsonObject.title.titleTextColor = data.title.titleTextColor
  jsonObject.background.picture = []
  for(num in readDir) {
    jsonObject.background.picture.push(readDir[num])
  }
  jsonObject.background.autoChange = data.autoChange
  jsonObject.background.interval = data.interval
  fs.writeFile(json_path.files[3],'',(err) => {
    if(err){
      log.error(err)
    }
  })
  fs.writeFile(json_path.files[3],JSON.stringify(jsonObject),(err) => {
    if(err){
      log.error(err)
    }
  })
})
ipcMain.on('open-folder', () => {
  cp.exec('explorer '+json_path.folder[6], (err) => {
    if(err){
      log.error(err)
    }
  })
})
ipcMain.on('start-up', (err,data) => {
  var setConfig = fs.readFileSync(json_path.files[3],"utf-8")
  var jsonObject = JSON.parse(setConfig)
  if(data) {
    app.setLoginItemSettings({
      openAtLogin:true
    })
    jsonObject.startUp = true
    dialog.showMessageBox(win,{
      type: "info",
      title: "XOnline",
      message: "已启用"
    })
  }else{
    app.setLoginItemSettings({
      openAtLogin:false
    })
    jsonObject.startUp = false
    dialog.showMessageBox(win,{
      type: "info",
      title: "XOnline",
      message: "已关闭"
    })  
  }
  fs.writeFile(json_path.files[3],'',(err) => {
    if(err){
      log.error(err)
    }
  })
  fs.writeFile(json_path.files[3],JSON.stringify(jsonObject),(err) => {
    if(err){
      log.error(err)
    }
  })
})
ipcMain.on('close-frp', () => {
  cp.exec('taskkill /f /t /im frpc.exe',() => {})
  fs.writeFile(json_path.files[4], '', (err) => {
    if(err){
      log.error(err)
    }
  }) 
  fs.writeFile(json_path.files[2],'',(err) => {
    if(err){
      log.error(err)
    }
  })
})
ipcMain.on('open-browser',(err,data) => {
  shell.openExternal(data)
})
ipcMain.on('clear-local-data', () => {
  var readDir = fs.readdirSync(json_path.folder[3])
  for(num in readDir) {
    fs.writeFile(path.join(json_path.folder[3],readDir[num]),'',(err) => {
      if(err){
        log.error(err)
      }
    })
  }
})
ipcMain.on('confirmed',() => {
  fs.writeFile(path.join(path.resolve(),'confirm.txt'),'true',(err) => {
    if(err){
      log.error(err)
    }
  })
})
app.on('window-all-closed', () => {
  //app_quit()
})
ipcMain.on('quit', () => {
  win.hide()
})
function app_quit() {
  if(process.platform !== 'darwin') {
    if(fs.readFileSync(json_path.files[4],"utf-8")){
      dialog.showMessageBox(win,{
        type: "warning",
        title: "XOnline",
        message: "请先关闭连接再退出程序"
      })
    }else{
      app.quit()
    }
  }
}

async function downloadFile(url, filepath) {
  const writer = fs.createWriteStream(filepath)
  const response = await axios({
      url: url,
      method: "GET",
      responseType: "stream",
  })
  response.data.pipe(writer)
  return new Promise((resolve, reject) => {
      writer.on("finish", resolve)
      writer.on("error", reject)
  })
}

function updater(url) {
  autoUpdater.setFeedURL(url)
  autoUpdater.on('error', (err) => {
    win.webContents.send("message", err)
  })
  autoUpdater.on('update-available', () => {
    autoUpdater.autoDownload = true
    win.webContents.send("message",true)
  })
  autoUpdater.on('update-not-available', ()=> {
    win.webContents.send("message",false)
  })
  autoUpdater.on('download-progress', (progressObj) => {
    win.webContents.send('downloadProgress', progressObj)
  })
  autoUpdater.on('update-downloaded', () => {
    ipcMain.on('update-now', () => {
      autoUpdater.quitAndInstall()
    })
    win.webContents.send('is-update-now')
  })
  ipcMain.on('check-for-update', () => {
    autoUpdater.checkForUpdates()
  })
}
