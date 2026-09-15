// Handle HTTP requests for events

const eventsService = require('../services/events.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const logger = require('../utils/logger');

const getAllEvents = async (req, res) => {
	try {
		const result = await eventsService.getAllEvents({
			date: req.query.date,
			upcoming: req.query.upcoming === 'true',
			category: req.query.category,
			page: parseInt(req.query.page, 10) || 1,
			limit: parseInt(req.query.limit, 10) || 50,
		});

		return paginatedResponse(res, result.data, result.pagination, 'Events retrieved successfully');
	} catch (error) {
		logger.error('Error in getAllEvents controller:', error);
		return errorResponse(res, 'Error fetching events', 500);
	}
};

const getEventById = async (req, res) => {
	try {
		const event = await eventsService.getEventById(req.params.id);
		return successResponse(res, event, 'Event retrieved successfully');
	} catch (error) {
		logger.error('Error in getEventById controller:', error);
		const notFound = error.code === 'PGRST116';
		return errorResponse(res, notFound ? 'Event not found' : 'Error fetching event', notFound ? 404 : 500);
	}
};

const getEventsByDate = async (req, res) => {
	try {
		const events = await eventsService.getEventsByDate(req.params.date);
		return successResponse(res, events, 'Events retrieved successfully');
	} catch (error) {
		logger.error('Error in getEventsByDate controller:', error);
		return errorResponse(res, 'Error fetching events', 500);
	}
};

const createEvent = async (req, res) => {
	try {
		const event = await eventsService.createEvent(req.body);
		return successResponse(res, event, 'Event created successfully', 201);
	} catch (error) {
		logger.error('Error in createEvent controller:', error);
		return errorResponse(res, 'Error creating event', 500);
	}
};

const updateEvent = async (req, res) => {
	try {
		const event = await eventsService.updateEvent(req.params.id, req.body);
		return successResponse(res, event, 'Event updated successfully');
	} catch (error) {
		logger.error('Error in updateEvent controller:', error);
		const notFound = error.code === 'PGRST116';
		return errorResponse(res, notFound ? 'Event not found' : 'Error updating event', notFound ? 404 : 500);
	}
};

const deleteEvent = async (req, res) => {
	try {
		await eventsService.deleteEvent(req.params.id);
		return successResponse(res, null, 'Event deleted successfully');
	} catch (error) {
		logger.error('Error in deleteEvent controller:', error);
		return errorResponse(res, 'Error deleting event', 500);
	}
};

module.exports = {
	getAllEvents,
	getEventById,
	getEventsByDate,
	createEvent,
	updateEvent,
	deleteEvent,
};

