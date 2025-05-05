const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // เชื่อมต่อ RDP
  connectRDP: (username, password, ip) =>
    ipcRenderer.invoke('connect-rdp', { username, password, ip }),

  // ดึงเฉพาะรายการ IP จากฐานข้อมูล
  getDevices: () =>
    ipcRenderer.invoke('get-devices'),

  // เชื่อมต่อสำหรับ Login
  loginRequest: (user_id, password) =>
    ipcRenderer.invoke('login-request', { user_id, password }),
});
