// Business logic for routing

const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Calculate campus route using pathway graph
 */
const calculateCampusRoute = async (fromLat, fromLng, toLat, toLng, accessibility = true) => {
  try {
    // Get pathway graph
    const { data: graph, error: graphError } = await supabase
      .from('pathway_graph')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (graphError) throw graphError;

    // Implement Dijkstra's algorithm here
    // This is a simplified version - you'll need to implement the full algorithm
    const route = calculateShortestPath(graph.graph_data, fromLat, fromLng, toLat, toLng, accessibility);
    
    return route;
  } catch (error) {
    logger.error('Error calculating campus route:', error);
    throw error;
  }
};

/**
 * Simple route calculation (placeholder for full implementation)
 */
const calculateShortestPath = (graphData, fromLat, fromLng, toLat, toLng, accessibility) => {
  // This is where you'd implement Dijkstra's algorithm
  // For now, return a direct route as placeholder
  const distance = haversineDistance(fromLat, fromLng, toLat, toLng);
  
  return {
    coords: [[fromLat, fromLng], [toLat, toLng]],
    totalDistance: Math.round(distance),
    totalTime: Math.max(1, Math.round(distance / 80)), // 80m per minute walking speed
    mode: 'direct',
    steps: [
      {
        instruction: 'Head towards your destination',
        distance: Math.round(distance),
        type: 'depart',
      },
      {
        instruction: 'Arrive at destination',
        distance: 0,
        type: 'arrive',
      },
    ],
  };
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
};

/**
 * Save route to history
 */
const saveRouteHistory = async (profileId, routeData) => {
  try {
    const { data, error } = await supabase
      .from('route_history')
      .insert({
        profile_id: profileId,
        ...routeData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error saving route history:', error);
    throw error;
  }
};

/**
 * Get user's route history
 */
const getUserRouteHistory = async (profileId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('route_history')
      .select(`
        *,
        to_place:to_place_id (name, slug),
        from_place:from_place_id (name, slug)
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error fetching route history:', error);
    throw error;
  }
};

module.exports = {
  calculateCampusRoute,
  saveRouteHistory,
  getUserRouteHistory,
};