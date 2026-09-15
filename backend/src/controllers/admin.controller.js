
const adminService = require('../services/admin.service');
const eventsService = require('../services/events.service');
const placesService = require('../services/places.service');
const feedbackService = require('../services/feedback.service');

// --- Dashboard / stats (from admin.service) ---
const getStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) { /* ... */ }
};

// --- Users (from admin.service) ---
const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers(req.query);
    res.json({ success: true, data: users });
  } catch (err) { /* ... */ }
};

// --- Feedback (delegates to feedback.service) ---
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await feedbackService.getAllFeedback(req.query); // admin variant
    res.json({ success: true, data: feedback });
  } catch (err) { /* ... */ }
};

// --- Events (delegates to events.service) ---
const createEvent = async (req, res) => {
  try {
    const event = await eventsService.createEvent(req.body, req.userId);
    res.status(201).json({ success: true, data: event });
  } catch (err) { /* ... */ }
};

// --- Places (delegates to places.service) ---
const createPlace = async (req, res) => {
  try {
    const place = await placesService.createPlace(req.body);
    res.status(201).json({ success: true, data: place });
  } catch (err) { /* ... */ }
};

module.exports = { getStats, getAllUsers, getAllFeedback, createEvent, createPlace, /* ... */ };