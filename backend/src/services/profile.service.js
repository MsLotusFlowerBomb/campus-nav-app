// Business logic for the current user's profile + favourites.

const { supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');

// Fields a user is allowed to change on their own profile.
// Everything else (id, role, email, student_number, created_at) is managed elsewhere.
const EDITABLE_FIELDS = [
  'full_name',
  'phone',
  'faculty',
  'year_of_study',
  'department',
  'avatar_url',
];

/**
 * Fetch the current user's profile.
 */
const getMyProfile = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(
      'id, role, student_number, full_name, email, phone, faculty, ' +
      'year_of_study, department, avatar_url, created_at, updated_at, last_login_at'
    )
    .eq('id', userId)
    .single();

  if (error) throw error;
  if (!data) {
    const e = new Error('Profile not found');
    e.status = 404;
    throw e;
  }
  return data;
};

/**
 * Update the current user's profile.
 * Only whitelisted fields are accepted — email/role/student_number are silently ignored.
 */
const updateMyProfile = async (userId, updates) => {
  const payload = {};

  for (const key of EDITABLE_FIELDS) {
    if (updates[key] !== undefined) {
      let value = updates[key];
      if (typeof value === 'string') value = value.trim();

      // Normalise empty strings to null for optional fields
      if (value === '') value = null;

      payload[key] = value;
    }
  }

  if (Object.keys(payload).length === 0) {
    const e = new Error('No valid fields to update');
    e.status = 400;
    throw e;
  }

  // Coerce year_of_study to integer if present
  if (payload.year_of_study !== undefined && payload.year_of_study !== null) {
    const n = parseInt(payload.year_of_study, 10);
    if (Number.isNaN(n) || n < 1 || n > 10) {
      const e = new Error('year_of_study must be a number between 1 and 10');
      e.status = 400;
      throw e;
    }
    payload.year_of_study = n;
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select(
      'id, role, student_number, full_name, email, phone, faculty, ' +
      'year_of_study, department, avatar_url, created_at, updated_at, last_login_at'
    )
    .single();

  if (error) throw error;
  return data;
};


/**
 * List favourites for a user, joined with place details.
 * Returns the fields the frontend's marker/list panel expects.
 */
const listFavourites = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('favourites')
    .select(`
      place_id,
      created_at,
      place:places (
        id,
        slug,
        name,
        code,
        category,
        type,
        latitude,
        longitude
      )
    `)
    .eq('profile_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Flatten — expose the place shape the frontend uses directly.
  return (data || [])
    .filter((row) => row.place)
    .map((row) => ({
      ...row.place,
      favourited_at: row.created_at,
    }));
};

/**
 * Add a favourite. Accepts either a UUID (place.id) or a slug (place.slug).
 * Idempotent — adding the same place twice is a no-op.
 */
const addFavourite = async (userId, placeIdentifier) => {
  if (!placeIdentifier) {
    const e = new Error('Place identifier is required');
    e.status = 400;
    throw e;
  }

  // Try to find by slug OR id in one query.
  // UUID format check helps avoid Postgres cast errors when an invalid UUID string is passed.
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(placeIdentifier);

  let lookup = supabaseAdmin
    .from('places')
    .select('id');

  if (isUuid) {
    // Could still be a slug that looks like a UUID — unlikely, but check both
    lookup = lookup.or(`id.eq.${placeIdentifier},slug.eq.${placeIdentifier}`);
  } else {
    lookup = lookup.eq('slug', placeIdentifier);
  }

  const { data: place, error: placeError } = await lookup.maybeSingle();

  if (placeError) throw placeError;
  if (!place) {
    const e = new Error('Place not found');
    e.status = 404;
    throw e;
  }

  const { error } = await supabaseAdmin
    .from('favourites')
    .upsert(
      { profile_id: userId, place_id: place.id },
      { onConflict: 'profile_id,place_id', ignoreDuplicates: true }
    );

  if (error) throw error;
  return { place_id: place.id, slug: placeIdentifier };
};
/**
 * Remove a favourite. Idempotent.
 */
const removeFavourite = async (userId, placeId) => {
  const { error } = await supabaseAdmin
    .from('favourites')
    .delete()
    .eq('profile_id', userId)
    .eq('place_id', placeId);

  if (error) throw error;
  return { place_id: placeId };
};



module.exports = {
  getMyProfile,
  updateMyProfile,
  listFavourites,
  addFavourite,
  removeFavourite,
};