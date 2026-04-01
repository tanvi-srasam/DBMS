import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Add artificial delay and logging to make it visible to the teacher
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method !== 'GET') {
    console.log('Body:', req.body);
  }
  next();
});

// Patients API
app.get('/api/patients', (req, res) => {
  db.all('SELECT * FROM patients ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/patients', (req, res) => {
  const { name, age, gender, contact, disease, address } = req.body;
  const sql = `INSERT INTO patients (name, age, gender, contact, disease, address) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, age, gender, contact, disease, address], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, name, age, gender, contact, disease, address });
  });
});

app.delete('/api/patients/:id', (req, res) => {
  db.run('DELETE FROM patients WHERE id = ?', req.params.id, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ deleted: this.changes > 0 });
  });
});

// Doctors API
app.get('/api/doctors', (req, res) => {
  db.all('SELECT * FROM doctors ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/doctors', (req, res) => {
  const { name, specialization, contact, email, availability } = req.body;
  const sql = `INSERT INTO doctors (name, specialization, contact, email, availability) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [name, specialization, contact, email, availability], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, name, specialization, contact, email, availability });
  });
});

app.delete('/api/doctors/:id', (req, res) => {
  db.run('DELETE FROM doctors WHERE id = ?', req.params.id, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ deleted: this.changes > 0 });
  });
});

// Appointments API
app.get('/api/appointments', (req, res) => {
  const sql = `
    SELECT appointments.*, patients.name as patient_name, doctors.name as doctor_name 
    FROM appointments 
    LEFT JOIN patients ON appointments.patient_id = patients.id 
    LEFT JOIN doctors ON appointments.doctor_id = doctors.id
    ORDER BY date DESC, time DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/appointments', (req, res) => {
  const { patient_id, doctor_id, date, time, status, reason } = req.body;
  const sql = `INSERT INTO appointments (patient_id, doctor_id, date, time, status, reason) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [patient_id, doctor_id, date, time, status || 'Scheduled', reason], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, patient_id, doctor_id, date, time, status: status || 'Scheduled', reason });
  });
});

app.put('/api/appointments/:id/status', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ updated: this.changes > 0 });
  });
});

// Dashboard Stats API
app.get('/api/stats', (req, res) => {
  const getCount = (table) => new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  Promise.all([
    getCount('patients'),
    getCount('doctors'),
    getCount('appointments')
  ]).then(([patients, doctors, appointments]) => {
    res.json({ patients, doctors, appointments });
  }).catch(err => res.status(500).json({ error: err.message }));
});


// Serve frontend in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all route to serve the React app for any undefined routes (React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`\n========================================`);
  console.log(`Backend Server running on port ${port}`);
  console.log(`Database connected at server/hospital.db`);
  console.log(`Open http://localhost:${port} to view the app directly!`);
  console.log(`========================================\n`);
});
