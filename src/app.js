const express = require('express');
const { DESKS, BookingError, createStore } = require('./bookings');

function createApp(store = createStore()) {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.get('/api/desks', (req, res) => {
    if (req.query.date) return res.json(store.freeDesks(req.query.date));
    res.json(DESKS);
  });

  app.get('/api/bookings', (req, res) => {
    res.json(store.list(req.query.date));
  });

  app.post('/api/bookings', (req, res) => {
    res.status(201).json(store.book(req.body));
  });

  app.delete('/api/bookings/:id', (req, res) => {
    res.json(store.cancel(Number(req.params.id)));
  });

  app.use((err, req, res, next) => {
    if (err instanceof BookingError) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  });

  return app;
}

module.exports = { createApp };
