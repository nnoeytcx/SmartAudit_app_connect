const { app, BrowserWindow, ipcMain } = require('electron');
const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const express = require('express');
const { getDBConnection } = require('./db'); 
const os = require('os');



// Helper: detect WSL
function isWSL() {
  if (process.platform !== 'linux') return false;
  try {
    const content = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    return content.includes('microsoft') || content.includes('wsl');
  } catch (e) {
    return false;
  }
}

// === CONFIG ===
const GATEWAY_IP = '192.168.121.195';  // IP ของ Gateway
// const USERNAME = 'Administrator';

// Store the last selected IP from the renderer (user selection)
let lastSelectedIP = null;

// Minimal Express API to expose the selected host to external callers.
// GET /host?ip=1.2.3.4  -> returns {"host":"1.2.3.4"}
// If query param is absent, returns the last selected IP stored in this process.
try {
  const apiApp = express();
  const apiPort = process.env.SELECTED_HOST_API_PORT || 4000;

  apiApp.get('/host', (req, res) => {
    const ip = req.query.ip || lastSelectedIP;
    if (!ip) return res.status(400).json({ error: 'no ip selected' });
    // ensure exact JSON formatting like: {"host":"104.214.179.163"}
    return res.json({ host: ip });
  });

  apiApp.listen(apiPort, () => {
    console.log(`[Selected Host API] listening on http://localhost:${apiPort}/host`);
  });
} catch (err) {
  console.error('Failed to start Selected Host API:', err && err.message);
}

// === Create Window ===
function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 650,
    title: 'Smart Audit',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  win.loadFile(path.join(__dirname, 'build', 'index.html'));
}

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

ipcMain.handle('get-session-ip-list', async () => {
  try {
    const connection = await getDBConnection(); 
    const [rows] = await connection.execute('SELECT DISTINCT ip FROM devices'); 
    const result = rows.map(row => ({ ip: row.ip })); 
    console.log("Device IPs:", result);
    return result;
  } catch (err) {
    console.error('DB fetch IP error:', err);
    return [];
  }
});

ipcMain.handle('get-hostname', async () => {
  const host = os.hostname();
  console.log('[Electron] Hostname:', host);
  return host;
});

ipcMain.handle('get-host-info', async () => {
  const nets = os.networkInterfaces();
  const ips = Object.values(nets)
    .flat()
    .filter(Boolean)
    .filter(n => n.family === 'IPv4' && !n.internal)
    .map(n => n.address);

  const info = { hostname: os.hostname(), ips };
  console.log('[Electron] Host info:', info);
  return info;
});

// === เชื่อมต่อ RDP ===
ipcMain.handle('connect-rdp', async (event, payload) => {
  try {
    const platform = process.platform;
    const inWsl = isWSL();
    const { username, password, ip } = payload || {};
    // remember selection from dropdown / ENTER SERVER flow
    if (ip) lastSelectedIP = ip;
    const target = ip || GATEWAY_IP;

    if (platform === 'win32') {
      // สำหรับ Windows
      const rdpCommand = `mstsc /v:${GATEWAY_IP}`;
      console.log('🚀 Opening RDP to Gateway on Windows...');
      exec(rdpCommand, (err) => {
        if (err) console.error('Windows RDP error:', err.message);
        else console.log('Windows RDP launched.');
      });

    }
    // สำหรับ macOS
    else if (platform === 'darwin') {
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
        else console.log('RDP launched via .rdp file.');
      });
    } else {
      // On Linux - support native clients or WSL invoking Windows mstsc
      console.log(`Platform linux detected. WSL: ${inWsl}`);

      // On Linux: prefer xfreerdp (even under WSL if available). Then fallback.
      try {
        // Check if xfreerdp exists
        const xPath = execSync('which xfreerdp', { stdio: 'pipe' }).toString().trim();
        if (xPath) {
          console.log('xfreerdp found at', xPath, '- spawning with debug output');
          const args = [`/v:127.0.0.1`];
          if (username) args.push(`/u:${String(username)}`);
          if (password) args.push(`/p:${String(password)}`);
          // ignore cert prompt to make automation easier
          args.push('/cert-ignore');

          // spawn and pipe output to main process console for debugging
          const { spawn } = require('child_process');
          const child = spawn('xfreerdp', args);

          console.log('Spawned:', 'xfreerdp', args.join(' '));

          child.stdout.on('data', (data) => {
            process.stdout.write(`[xfreerdp stdout] ${data}`);
          });
          child.stderr.on('data', (data) => {
            process.stderr.write(`[xfreerdp stderr] ${data}`);
          });
          child.on('close', (code) => {
            console.log(`xfreerdp exited with code ${code}`);
          });
          return;
        }
      } catch (e) {
        // xfreerdp not found, continue to other fallbacks
      }

      // If running under WSL and xfreerdp isn't available in WSL, try invoking Windows mstsc
      if (inWsl) {
        try {
          const cmd = `cmd.exe /C start mstsc /v:${target}`;
          exec(cmd, (err) => {
            if (err) console.error('WSL -> mstsc launch error:', err.message);
            else console.log('WSL: triggered Windows mstsc via cmd.exe');
          });
          return;
        } catch (err) {
          console.error('WSL mstsc trigger failed:', err.message);
        }
      }

      // Fallback to remmina or rdesktop on native Linux
      const clients = [
        { cmd: 'remmina', args: [`-c`, `rdp://${target}`] },
        { cmd: 'rdesktop', args: [target] }
      ];

      (async () => {
        for (const c of clients) {
          try {
            const whichPath = execSync(`which ${c.cmd}`, { stdio: 'pipe' }).toString().trim();
            if (whichPath) {
              console.log(`Launching ${c.cmd} -> ${whichPath}`);
              exec(`${c.cmd} ${c.args.join(' ')}`, (err) => {
                if (err) console.error(`${c.cmd} launch error:`, err.message);
                else console.log(`${c.cmd} launched.`);
              });
              return;
            }
          } catch (e) {
            // not found, continue
          }
        }

        console.error('No RDP client found on Linux to launch.');
      })();
    }

  } catch (err) {
    console.error('Connect-rdp Error:', err.message);
  }
});

ipcMain.handle('login-request-with-ip', async (event, { user_id, password, server_ip }) => {
  try {
    console.log('🌐 Login to:', server_ip, 'User:', user_id);

    const response = await axios.post(
      `http://${server_ip}:3000/api/login`,
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
    console.error('Login With IP Error:', err.message);
    return {
      success: false,
      message: 'Cannot connect to server at ' + server_ip
    };
  }
});

ipcMain.handle('check-rdp-installed', async () => {
  try {
    const platform = process.platform;
    const inWsl = isWSL();

    if (platform === 'win32') {
      const system32Path = path.join(process.env.WINDIR || 'C:\\Windows', 'System32', 'mstsc.exe');
      const exists = fs.existsSync(system32Path);
      console.log("RDP Installed ? :", exists);
      return exists;
    }

    if (platform === 'darwin') {
      const macRdpPath = '/Applications/Microsoft Remote Desktop.app';
      const exists = fs.existsSync(macRdpPath);
      console.log("RDP Installed ? :", exists);
      return exists;
    }

    if (platform === 'linux') {
      // If under WSL, try to see if Windows mstsc is available via 'where' through cmd.exe
      if (inWsl) {
        try {
          const out = execSync('cmd.exe /C where mstsc.exe', { stdio: 'pipe' }).toString().trim();
          if (out) {
            console.log('WSL: Found Windows mstsc.exe via cmd.exe ->', out);
            return true;
          }
        } catch (e) {
          // not found on Windows side
        }
      }

      try {
        const clients = ['xfreerdp', 'remmina', 'rdesktop'];
        for (const c of clients) {
          try {
            const pathFound = execSync(`which ${c}`, { stdio: 'pipe' }).toString().trim();
            if (pathFound) {
              console.log(`RDP client found on Linux: ${c} -> ${pathFound}`);
              return true;
            }
          } catch (e) {
            // not found, continue
          }
        }
        console.log('No known Linux RDP clients found (xfreerdp/remmina/rdesktop)');
        return false;
      } catch (err) {
        console.error('Linux RDP detection error:', err.message);
        return false;
      }
    }

    return false;
  } catch (err) {
    console.error('check-rdp-installed error:', err.message);
    return false;
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


