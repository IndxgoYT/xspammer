const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const open = require("open");

Menu.setApplicationMenu(false);

require("electron-reload")(__dirname, {
  electron: path.join(process.cwd(), "node_modules", ".bin", "electron"),
});

if (require("electron-squirrel-startup")) {
  app.quit();
}

global.ProgressBar = require("electron-progressbar");

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    width: 1000,
    height: 600,
    frame: false,
    resizable: false,
    titleBarStyle: "hidden",
    icon: path.join(__dirname, "img/icon.png"),
  });

  mainWindow.loadFile(path.join(__dirname, "alert.html"));

  mainWindow.webContents.on("new-window", function (event, url) {
    event.preventDefault();
    open(url);
  });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
