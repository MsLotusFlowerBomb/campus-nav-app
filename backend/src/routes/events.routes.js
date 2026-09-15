// Routes for events endpoints

const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events.controller');
const { authenticateUser, requireAdmin } = require('../middleware/auth');
const { validateEvent } = require('../middleware/validation');

// Public routes
router.get('/', eventsController.getAllEvents);
router.get('/date/:date', eventsController.getEventsByDate);
router.get('/:id', eventsController.getEventById);

// Admin routes
router.post('/', authenticateUser, requireAdmin, validateEvent, eventsController.createEvent);
router.put('/:id', authenticateUser, requireAdmin, validateEvent, eventsController.updateEvent);
router.delete('/:id', authenticateUser, requireAdmin, eventsController.deleteEvent);

module.exports = router;