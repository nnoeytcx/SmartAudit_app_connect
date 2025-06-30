const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// === CONFIG ===
const GATEWAY_IP = '192.168.121.195';  // IP ของ Gateway
// const USERNAME = 'Administrator';

// === Create Window ===
function createWindow() {
  const win = new BrowserWindow({
    width: 470,
    height: 620,
    title: 'Smart Audit',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  win.loadFile(path.join(__dirname, 'build', 'index.html'));
}
// === ลอง ping server ===
ipcMain.handle('ping-server', async (event, ip) => {
  try {
    const res = await axios.get(`http://${ip}:3000/ping`);
    if (res.data.status === 'ok') {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
});

// === เชื่อมต่อ RDP ===
ipcMain.handle('connect-rdp', async () => {
  try {
    const platform = process.platform;

    if (platform === 'win32') {
      // สำหรับ Windows
      const rdpCommand = `mstsc /v:${GATEWAY_IP}`;
      console.log('🚀 Opening RDP to Gateway on Windows...');
      exec(rdpCommand, (err) => {
        if (err) console.error('❌ Windows RDP error:', err.message);
        else console.log('✅ Windows RDP launched.');
      });

    }  else if (platform === 'darwin') {
      const rdpContent = `
          full address:s:${GATEWAY_IP}
          prompt for credentials:i:1
          screen mode id:i:2
          desktopwidth:i:1280
          desktopheight:i:720
          session bpp:i:32
          `.trim();

      const filePath = path.join(require('os').tmpdir(), 'temp_connection.rdp');
      fs.writeFileSync(filePath, rdpContent);

      exec(`open "${filePath}"`, (err) => {
        if (err) console.error('❌ Failed to open .rdp file:', err.message);
        else console.log('✅ RDP launched via .rdp file.');
      });
        // สำหรับ macOS
      //  const rdpUrl = `rdp://${GATEWAY_IP}`;
      //  const openCommand = `open "${rdpUrl}"`;
      //  console.log('🚀 Opening RDP to Gateway on macOS...');
      //  exec(openCommand, (err) => {
      //    if (err) console.error('❌ macOS RDP error:', err.message);
      //    else console.log('✅ macOS RDP launched.');
      //  });

    } else {
      console.error(`❌ Unsupported platform: ${platform}`);
    }

  } catch (err) {
    console.error('❌ connect-rdp Error:', err.message);
  }
});

// === เชื่อมต่อ API login แบบกำหนด IP ===
ipcMain.handle('login-request-with-ip', async (event, { user_id, password, server_ip }) => {
  try {
    console.log('🌐 Login to:', server_ip, 'User:', user_id);

    const response = await axios.post(
      `http://${server_ip}:3000/login`,
      {
        user_id: parseInt(user_id),
        password
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      return {
        success: true,
        message: 'Login successful',
        user_info: response.data.user_info
      };
    } else {
      return {
        success: false,
        message: response.data.message
      };
    }
  } catch (err) {
    console.error('❌ Login With IP Error:', err.message);
    return {
      success: false,
      message: 'Cannot connect to server at ' + server_ip
    };
  }
});

// === Electron lifecycle ===
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


