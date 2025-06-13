// require('dotenv').config(); // โหลดค่าจาก .env

// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');

// const app = express();
// // const port = 3000;

// // ตั้งค่า CORS และ JSON parsing
// app.use(cors());
// app.use(express.json());

// // สร้างการเชื่อมต่อกับฐานข้อมูล MySQL
// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT, // อย่าลืมใส่ port ด้วย
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// // เชื่อมต่อกับฐานข้อมูล
// db.connect((err) => {
//   if (err) {
//     console.error('❌ Database connection error:', err);
//     return;
//   }
//   console.log('✅ Database connected!');
// });

// // สร้าง API สำหรับ login
// app.post('/login', (req, res) => {
//   const { user_id, password } = req.body;

//   db.query(
//     'SELECT * FROM users WHERE user_id = ? AND password = ?',
//     [user_id, password],
//     (err, results) => {
//       if (err) {
//         console.error('❌ Database query error:', err);
//         return res.status(500).json({ success: false, message: 'Database error' });
//       }

//       if (results.length > 0) {
//         return res.json({
//           success: true,
//           message: 'Login successful',
//           user_info: results[0],
//         });
//       } else {
//         return res.json({
//           success: false,
//           message: 'Invalid Username or Password',
//         });
//       }
//     }
//   );
// });

// // เริ่มต้น server
// app.listen(port, () => {
//   console.log(`🚀 Server is running on http://localhost:${port}`);
// });
