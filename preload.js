const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // เชื่อมต่อ RDP
  connectRDP: (username, password, ip) =>
    ipcRenderer.invoke('connect-rdp', { username, password, ip }),

  // ดึงรายการ IP จากฐานข้อมูล (device)
  getDevices: () =>
    ipcRenderer.invoke('get-devices'),

  // Login แบบกำหนด IP
  loginRequestWithIP: ({ user_id, password, server_ip }) =>
    ipcRenderer.invoke('login-request-with-ip', { user_id, password, server_ip }),

  // ใช้สำหรับเช็คว่าติดต่อ server ได้มั้ย
  pingServer: (ip) =>
    ipcRenderer.invoke('ping-server', ip),

  // ✅ เพิ่มตรงนี้: ดึง session IP จากฐานข้อมูล
  getSessionIPList: () =>
    ipcRenderer.invoke('get-session-ip-list')
});
