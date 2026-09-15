const profileService = require('../services/profile.service');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * GET /api/v1/profile
 */
const getMe = async (req, res) => {
  try {
    const profile = await profileService.getMyProfile(req.userId);
    return successResponse(res, profile, 'Profile retrieved');
  } catch (error) {
    logger.error('Error in getMe:', error.message);
    return errorResponse(res, error.message || 'Could not fetch profile', error.status || 500);
  }
};

/**
 * PUT /api/v1/profile
 * Body: { full_name?, phone?, faculty?, year_of_study?, department?, avatar_url? }
 */
const updateMe = async (req, res) => {
  try {
    const profile = await profileService.updateMyProfile(req.userId, req.body || {});
    return successResponse(res, profile, 'Profile updated');
  } catch (error) {
    logger.error('Error in updateMe:', error.message);
    return errorResponse(res, error.message || 'Could not update profile', error.status || 500);
  }
};

/**
 * GET /api/v1/profile/favourites
 */
const getFavourites = async (req, res) => {
  try {
    const favourites = await profileService.listFavourites(req.userId);
    return successResponse(res, favourites, 'Favourites retrieved');
  } catch (error) {
    logger.error('Error in getFavourites:', error.message);
    return errorResponse(res, error.message || 'Could not fetch favourites', error.status || 500);
  }
};

/**
 * POST /api/v1/profile/favourites/:placeId
 */
const addFavourite = async (req, res) => {
  try {
    const { placeId } = req.params;
    if (!placeId) return errorResponse(res, 'placeId is required', 400);

    const result = await profileService.addFavourite(req.userId, placeId);
    return successResponse(res, result, 'Added to favourites', 201);
  } catch (error) {
    logger.error('Error in addFavourite:', error.message);
    return errorResponse(res, error.message || 'Could not add favourite', error.status || 500);
  }
};

/**
 * DELETE /api/v1/profile/favourites/:placeId
 */
const removeFavourite = async (req, res) => {
  try {
    const { placeId } = req.params;
    if (!placeId) return errorResponse(res, 'placeId is required', 400);

    const result = await profileService.removeFavourite(req.userId, placeId);
    return successResponse(res, result, 'Removed from favourites');
  } catch (error) {
    logger.error('Error in removeFavourite:', error.message);
    return errorResponse(res, error.message || 'Could not remove favourite', error.status || 500);
  }
};

module.exports = {
  getMe,
  updateMe,
  getFavourites,
  addFavourite,
  removeFavourite,
};