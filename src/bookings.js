const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

const DESKS = [
  { id: 'A1', zone: 'quiet' },
  { id: 'A2', zone: 'quiet' },
  { id: 'B1', zone: 'team' },
  { id: 'B2', zone: 'team' },
  { id: 'B3', zone: 'team' },
];

function parseInput(input = {}) {
  const person = String(input.person ?? '').trim();
  const deskId = String(input.deskId ?? '').trim();
  const date = String(input.date ?? '');
  if (!person) throw new BookingError('person is required');
  if (!deskId) throw new BookingError('deskId is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !dayjs.utc(date).isValid()) {
    throw new BookingError('date must be YYYY-MM-DD');
  }
  return { person, deskId, date };
}

class BookingError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function todayISO() {
  return dayjs.utc().format('YYYY-MM-DD');
}

function isWeekend(date) {
  const day = dayjs.utc(date).day();
  return day === 0 || day === 6;
}

function createStore() {
  const bookings = [];
  let nextId = 1;

  function list(date) {
    return bookings.filter((b) => !date || b.date === date);
  }

  function book(input) {
    const { person, deskId, date } = parseInput(input);

    if (!DESKS.some((d) => d.id === deskId)) {
      throw new BookingError(`unknown desk ${deskId}`, 404);
    }
    if (date < todayISO()) {
      throw new BookingError('date is in the past');
    }
    if (isWeekend(date)) {
      throw new BookingError('the office is closed at weekends');
    }
    if (bookings.some((b) => b.date === date && b.deskId === deskId)) {
      throw new BookingError(`desk ${deskId} is already booked on ${date}`, 409);
    }
    if (bookings.some((b) => b.date === date && b.person === person)) {
      throw new BookingError(`${person} already has a desk on ${date}`, 409);
    }

    const booking = { id: nextId++, person, deskId, date };
    bookings.push(booking);
    return booking;
  }

  function cancel(id) {
    const i = bookings.findIndex((b) => b.id === id);
    if (i === -1) throw new BookingError(`booking ${id} not found`, 404);
    return bookings.splice(i, 1)[0];
  }

  function freeDesks(date) {
    const taken = new Set(list(date).map((b) => b.deskId));
    return DESKS.filter((d) => !taken.has(d.id));
  }

  return { list, book, cancel, freeDesks };
}

module.exports = { DESKS, BookingError, createStore, isWeekend };
