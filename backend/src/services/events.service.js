// Business logic for events

const { supabase, supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Get all events with optional filters
 */
const getAllEvents = async (filters = {}) => {
    try {
        let query = supabase
            .from('events')
            .select('*', { count: 'exact' });

        if (filters.date) {
            query = query.eq('event_date', filters.date);
        }

        if (filters.upcoming) {
            query = query.gte('event_date', new Date().toISOString().slice(0, 10));
        }

        if (filters.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
        }

        const page = Math.max(filters.page || 1, 1);
        const limit = Math.min(Math.max(filters.limit || 50, 1), 100);
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, error, count } = await query
            .order('event_date', { ascending: true })
            .order('start_time', { ascending: true })
            .range(start, end);

        if (error) throw error;

        return {
            data,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    } catch (error) {
        logger.error('Error fetching events:', error);
        throw error;
    }
};

/** Get a single event by ID */
const getEventById = async (eventId) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        logger.error('Error fetching event:', error);
        throw error;
    }
};

/** Get events for a specific date */
const getEventsByDate = async (eventDate) => {
    const result = await getAllEvents({ date: eventDate, page: 1, limit: 100 });
    return result.data;
};

/** Create a new event (admin only) */
const createEvent = async (eventData) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('events')
            .insert(eventData)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        logger.error('Error creating event:', error);
        throw error;
    }
};

/** Update an event (admin only) */
const updateEvent = async (eventId, updates) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('events')
            .update(updates)
            .eq('id', eventId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        logger.error('Error updating event:', error);
        throw error;
    }
};

/** Delete an event (admin only) */
const deleteEvent = async (eventId) => {
    try {
        const { error } = await supabaseAdmin
            .from('events')
            .delete()
            .eq('id', eventId);

        if (error) throw error;
        return true;
    } catch (error) {
        logger.error('Error deleting event:', error);
        throw error;
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
