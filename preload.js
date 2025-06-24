const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // เชื่อมต่อ RDP
  connectRDP: (username, password, ip) =>
    ipcRenderer.invoke('connect-rdp', { username, password, ip }),

  // ดึงรายการ IP จากฐานข้อมูล
  getDevices: () =>
    ipcRenderer.invoke('get-devices'),

  // เชื่อมต่อสำหรับ Login แบบ default (IP คงที่)
  // loginRequest: (user_id, password) =>
  //   ipcRenderer.invoke('login-request', { user_id, password }),

  // เชื่อมต่อ Login แบบกำหนด IP
  loginRequestWithIP: ({ user_id, password, server_ip }) =>
    ipcRenderer.invoke('login-request-with-ip', { user_id, password, server_ip }),

  // ใช้สำหรับเช็คว่าติดต่อ server ได้มั้ย
  pingServer: (ip) =>
    ipcRenderer.invoke('ping-server', ip)
});
