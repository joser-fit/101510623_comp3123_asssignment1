const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const connectDB = require('./db');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Try again later.' }
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Employee API is running'
  });
});

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(503).json({
      message: 'Database temporarily unavailable'
    });
  }
});

app.use('/api/v1/user', authLimiter, authRoutes);
app.use('/api/v1/emp/employees', employeeRoutes);

module.exports = app;