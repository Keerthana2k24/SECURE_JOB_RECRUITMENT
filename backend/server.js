const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Setup MySQL connection pool; adjust credentials and port if needed
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'keer',
  database: 'job_verification',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// POST /logTransaction - receive and store logs
app.post('/logTransaction', async (req, res) => {
  const {
    type,
    user_address,
    document_hash,
    transaction_hash,
    verified,
    error_msg,
    block_number,
    timestamp,
  } = req.body;

  console.log('Received log:', req.body);

  try {
    const [result] = await pool.execute(
      `INSERT INTO transactions
       (type, user_address, document_hash, transaction_hash, verified, error_msg, block_number, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        type || null,
        user_address || null,
        document_hash || null,
        transaction_hash || null,
        typeof verified === 'undefined' ? null : verified,
        error_msg || null,
        block_number || null,
        timestamp ? new Date(timestamp) : new Date(),
      ]
    );

    res.json({ status: 'success', insertedId: result.insertId });
  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /logs - return recent 100 logs ordered by time desc
app.get('/logs', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) {
    console.error('DB Fetch Error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
