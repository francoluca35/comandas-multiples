const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../public/Assets/LogoApp.png"),
    show: false,
    titleBarStyle: "default",
  });

  // Cargar la aplicación
  if (isDev) {
    // En desarrollo, cargar desde el servidor de desarrollo de Next.js
    const startURL = process.env.ELECTRON_START_URL || "http://localhost:3000";

    mainWindow.loadURL(startURL).catch((error) => {
      console.log("Error cargando URL principal, intentando puerto 3001...");
      mainWindow.loadURL("http://localhost:3001").catch((error2) => {
        console.error("Error cargando aplicación:", error2);
        mainWindow.loadURL(
          "data:text/html,<h1>Error cargando aplicación</h1><p>Verifica que Next.js esté ejecutándose en el puerto 3000 o 3001</p>"
        );
      });
    });

    // Abrir las herramientas de desarrollo
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar desde el build de Next.js
    const indexPath = path.join(__dirname, "../out/index.html");
    mainWindow.loadFile(indexPath);
  }

  // Mostrar la ventana cuando esté lista
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Manejar el cierre de la ventana
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Prevenir la navegación a URLs externas
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (
      isDev &&
      (parsedUrl.origin === "http://localhost:3000" ||
        parsedUrl.origin === "http://localhost:3001")
    ) {
      return;
    }

    if (!isDev && parsedUrl.protocol === "file:") {
      return;
    }

    event.preventDefault();
  });

  // Manejar nuevas ventanas
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return { action: "deny" };
  });
}

// Crear menú personalizado
function createMenu() {
  const template = [
    {
      label: "Archivo",
      submenu: [
        {
          label: "Nueva Ventana",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            createWindow();
          },
        },
        { type: "separator" },
        {
          label: "Salir",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Editar",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "Ver",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Ventana",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Eventos de la aplicación
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Manejar el protocolo de seguridad
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
  });
});

// IPC handlers para comunicación entre procesos
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("get-app-name", () => {
  return app.getName();
});
