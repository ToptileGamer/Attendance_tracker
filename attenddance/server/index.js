import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// --- AUTH ROUTES ---

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) return res.status(400).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const result = stmt.run(username, hashedPassword);

    const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- ATTENDANCE ROUTES ---

app.get('/api/attendance', authMiddleware, (req, res) => {
  try {
    const userId = req.user.userId;
    const records = db.prepare('SELECT date, subject, period_id, status FROM attendance WHERE user_id = ?').all(userId);
    
    // We must format the records cleanly so the frontend useAttendance hook can seamlessly hydrate its structure
    const history = records.map(r => ({
      date: r.date,
      subject: r.subject,
      periodId: r.period_id,
      status: r.status
    }));

    // Aggregate the raw attendance summary object from historical rows
    const attendance = {};
    for (const record of history) {
      if (!attendance[record.subject]) {
        attendance[record.subject] = { attended: 0, missed: 0, cancelled: 0 };
      }
      attendance[record.subject][record.status]++;
    }

    res.json({ attendance, history });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

app.post('/api/attendance', authMiddleware, (req, res) => {
  try {
    const userId = req.user.userId;
    const { history } = req.body; 
    
    const insert = db.prepare(`
      INSERT INTO attendance (user_id, date, subject, period_id, status) 
      VALUES (@userId, @date, @subject, @periodId, @status)
      ON CONFLICT(user_id, date, subject, period_id) DO UPDATE SET status=excluded.status
    `);

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
         insert.run(row);
      }
    });

    db.prepare('DELETE FROM attendance WHERE user_id = ?').run(userId);
    insertMany(history.map(h => ({
      userId,
      date: h.date,
      subject: h.subject,
      periodId: h.periodId,
      status: h.status
    })));

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ error: 'Failed to save attendance data' });
  }
});

app.listen(PORT, () => {
  console.log(`Express API Server with Auth running on http://localhost:${PORT}`);
});
