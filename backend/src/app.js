const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const formsRouter = require('./routes/forms.routes');

function createApp () {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/forms', formsRouter);

  app.use((req, res) => {
    res.status(404).json({ message: 'Recurso no encontrado' });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
      message: err.message || 'Error interno del servidor'
    });
  });

  return app;
}

module.exports = createApp;
