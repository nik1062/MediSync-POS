const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const sequelize = require('./config/database');
require('./models'); // registers associations

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const doctorRoutes = require('./routes/doctor.routes');
const consultationRoutes = require('./routes/consultation.routes');
const errorHandler = require('./middleware/errorHandler.middleware');
const ApiError = require('./utils/ApiError');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/doctors', doctorRoutes);
app.use('/consultations', consultationRoutes);
app.use('/availability', require('./routes/availability.routes'));
app.use('/discovery', require('./routes/discovery.routes'));
app.use('/appointments', require('./routes/appointment.routes'));
app.use('/api/pos', require('./routes/pos.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/family', require('./routes/family.routes'));
app.use('/documents', require('./routes/document.routes'));
app.use('/reviews', require('./routes/review.routes'));
app.use('/prescriptions', require('./routes/prescription.routes'));

app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

app.use(errorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    await sequelize.sync();
    console.log('Models synced');

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
