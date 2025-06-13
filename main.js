const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');

const mysql = require('mysql2');
const axios = require('axios'); // นำเข้า axios


// === CONFIG ===
const GATEWAY_IP = '192.168.121.195';  // IP ของ Gateway

// === Set up MySQL Connection ===
const db = mysql.createConnection({
  host: process.env.DB_HOST,     // ใช้ค่าจาก .env
  port: process.env.DB_PORT,     // ใช้ค่าจาก .env
  user: process.env.DB_USER,     // ใช้ค่าจาก .env
  password: process.env.DB_PASSWORD, // ใช้ค่าจาก .env
  database: process.env.DB_NAME  // ใช้ค่าจาก .env
});

// เชื่อมต่อกับฐานข้อมูล
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    return;
  }
  console.log('✅ Database connected!');
});



// === Create Window ===
function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 563,
    title: 'Smart Audit',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  win.loadFile(path.join(__dirname, 'build', 'index.html'));
}

ipcMain.handle('login-request', async (event, { user_id, password }) => {
  return new Promise((resolve) => {
    const sql = 'SELECT * FROM users WHERE user_id = ? AND password_hash = ?';
    db.query(sql, [user_id, password], (err, results) => {
      if (err) {
        console.error('❌ MySQL Login Error:', err);
        return resolve({ success: false, message: 'Database error' });
      }

      if (results.length > 0) {
        // ✅ เก็บ user_id ไว้ใน global ตัวแปร เพื่อใช้ตอน logout
        global.loggedInUserId = user_id;

        // 🟢 อัปเดตสถานะเป็น active
        const updateStatusSql = 'UPDATE users SET status = "active" WHERE user_id = ?';
        db.query(updateStatusSql, [user_id]);

        return resolve({
          success: true,
          message: 'Login successful',
          user_info: results[0]
        });
      } else {
        return resolve({
          success: false,
          message: 'Invalid Username or Password'
        });
      }
    });
  });
});

app.on('before-quit', () => {
  if (global.loggedInUserId) {
    const logoutSql = 'UPDATE users SET status = "inactive" WHERE user_id = ?';
    db.query(logoutSql, [global.loggedInUserId]);
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

    } else if (platform === 'darwin') {
      // สำหรับ macOS
      const rdpUrl = `rdp://${GATEWAY_IP}`;
      const openCommand = `open "${rdpUrl}"`;
      console.log('🚀 Opening RDP to Gateway on macOS...');
      exec(openCommand, (err) => {
        if (err) console.error('❌ macOS RDP error:', err.message);
        else console.log('✅ macOS RDP launched.');
      });

    } else {
      console.error(`❌ Unsupported platform: ${platform}`);
    }

  } catch (err) {
    console.error('❌ connect-rdp Error:', err.message);
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




// const { app, BrowserWindow, ipcMain } = require('electron');
// const { exec } = require('child_process');
// const path = require('path');
// const axios = require('axios');

// // === CONFIG ===
// const GATEWAY_IP = '192.168.121.195';  // IP ของ Gateway

// // === Create Window ===
// function createWindow() {
//   const win = new BrowserWindow({
//     width: 400,
//     height: 563,
//     title: 'Smart Audit',
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       nodeIntegration: true,
//     },
//   });

//   win.loadFile(path.join(__dirname, 'build', 'index.html'));
// }

// // === เชื่อมต่อ API สำหรับ login ===
// // ipcMain.handle('login-request', async (event, { user_id, password }) => {
// //   try {
// //     const response = await axios.post('http://192.168.121.195:3000/login', {
// //       user_id,
// //       password,
// //     });

// //     if (response.data.success) {
// //       return { success: true, message: 'Login successful', user_info: response.data.user_info };
// //     } else {
// //       return { success: false, message: 'Invalid Username or Password' };
// //     }
// //   } catch (err) {
// //     console.error('❌ Login Error:', err.message);
// //     return { success: false, message: 'Error connecting to the server' };
// //   }
// // });

// // === เชื่อมต่อ RDP ===
// ipcMain.handle('connect-rdp', async () => {
//   try {
//     const platform = process.platform;

//     if (platform === 'win32') {
//       // สำหรับ Windows
//       const rdpCommand = `mstsc /v:${GATEWAY_IP}`;
//       console.log('🚀 Opening RDP to Gateway on Windows...');
//       exec(rdpCommand, (err) => {
//         if (err) console.error('❌ Windows RDP error:', err.message);
//         else console.log('✅ Windows RDP launched.');
//       });

//     } else if (platform === 'darwin') {
//       // สำหรับ macOS
//       const rdpUrl = `rdp://${GATEWAY_IP}`;
//       const openCommand = `open "${rdpUrl}"`;
//       console.log('🚀 Opening RDP to Gateway on macOS...');
//       exec(openCommand, (err) => {
//         if (err) console.error('❌ macOS RDP error:', err.message);
//         else console.log('✅ macOS RDP launched.');
//       });

//     } else {
//       console.error(`❌ Unsupported platform: ${platform}`);
//     }

//   } catch (err) {
//     console.error('❌ connect-rdp Error:', err.message);
//   }
// });

// // === Electron lifecycle ===
// app.whenReady().then(() => {
//   createWindow();

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });


