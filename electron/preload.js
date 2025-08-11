const { contextBridge, ipcRenderer } = require("electron");

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Información de la aplicación
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getAppName: () => ipcRenderer.invoke("get-app-name"),

  // Funciones de ventana
  minimize: () => ipcRenderer.invoke("window-minimize"),
  maximize: () => ipcRenderer.invoke("window-maximize"),
  close: () => ipcRenderer.invoke("window-close"),

  // Funciones de sistema
  platform: process.platform,
  isDev: process.env.NODE_ENV === "development",

  // Funciones de archivos (si es necesario)
  openFile: (filePath) => ipcRenderer.invoke("open-file", filePath),
  saveFile: (filePath, data) => ipcRenderer.invoke("save-file", filePath, data),

  // Funciones de impresión
  print: (options) => ipcRenderer.invoke("print", options),

  // Funciones de notificaciones
  showNotification: (title, body) =>
    ipcRenderer.invoke("show-notification", title, body),

  // Funciones de diálogo
  showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),

  // Funciones de menú
  setMenu: (template) => ipcRenderer.invoke("set-menu", template),

  // Eventos
  on: (channel, callback) => {
    // Whitelist channels
    const validChannels = ["app-version", "file-opened", "print-complete"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  removeListener: (channel, callback) => {
    const validChannels = ["app-version", "file-opened", "print-complete"];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  },
});

// Exponer información del entorno
contextBridge.exposeInMainWorld("process", {
  env: {
    NODE_ENV: process.env.NODE_ENV,
    ELECTRON_IS_DEV: process.env.NODE_ENV === "development",
  },
});
