/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, desktopCapturer} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { createFactory } from 'react';

const authService = require('../services/auth-service');
const apiService = require('../services/api-service');

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

ipcMain.on('openExternalLink', async (event, link) => {
  shell.openExternal(link);
})

ipcMain.on('log', (message) => {
  console.log(message)
})

// Get video sources for screen share
ipcMain.on('getVideoSources', async (event) => {
  console.log("hello")
  try{
    const sources = await desktopCapturer.getSources({types: ['window', 'screen']})
    const result = sources.map((source) => ({
      id: source.id,
      name: source.name,
      appIconUrl: source?.appIcon?.toDataURL(),
      thumbnailUrl: source?.thumbnail?.toDataURL(),
    }))
    event.reply('resulting_sources', result)
  }
  catch (error) {
    console.error('Error getting desktop sources:', error);
    return [];
  }
})

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('flump', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('flump')
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      // Temp disable CORS
      nodeIntegration: true,
      webSecurity: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.setMinimumSize(1280, 720)

  mainWindow.webContents.openDevTools()

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

let authWin = null;

function createAuthWindow() {
  destroyAuthWin();

  authWin = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false
    }
  });

  authWin.loadURL(authService.getAuthenticationURL());

  const {session: {webRequest}} = authWin.webContents;

  const filter = {
    urls: [
      'http://localhost/callback*'
    ]
  };

  webRequest.onBeforeRequest(filter, async ({url}) => {
    await authService.loadTokens(url);
    await createWindow();
    return destroyAuthWin();
  });

  authWin.on('authenticated', () => {
    destroyAuthWin();
  });

  authWin.on('closed', () => {
    authWin = null;
  });
}

function destroyAuthWin() {
  if (!authWin) return;
  authWin.close();
  authWin = null;
}

function createLogoutWindow() {
  const logoutWindow = new BrowserWindow({
    show: false,
  });

  logoutWindow.loadURL(authService.getLogOutUrl());

  logoutWindow.on('ready-to-show', async () => {
    await authService.logout();
    logoutWindow.close();
    createAuthWindow();
  });
}


async function showWindow() {
  try {
    await authService.refreshTokens();
    createWindow();
  } catch (err) {
    createAuthWindow();
  }
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const lock = app.requestSingleInstanceLock()
let login_data

app.whenReady().then(() => {
  ipcMain.handle('auth:get-profile', authService.getProfile);
  ipcMain.handle('auth:get-token', authService.getAccessToken);
  ipcMain.handle('api:get-private-data', apiService.getPrivateData);
  ipcMain.on('auth:log-out', () => {
    BrowserWindow.getAllWindows().forEach(window => window.close());
    createLogoutWindow();
  });

  showWindow();
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) showWindow();
  });
}).catch(console.log);

app.on('open-url', (event, url) => {
  if (mainWindow)
    mainWindow.webContents.send("login-data", url)
})

module.exports = {
  createWindow,
}