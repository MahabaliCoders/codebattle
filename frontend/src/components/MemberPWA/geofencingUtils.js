/**
 * Haversine formula to calculate the distance between two points on Earth.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} - Distance in meters
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Validates if the current coordinates are within the event's allowed radius.
 * @param {object} currentPos - { lat, lng }
 * @param {object} targetPos - { lat, lng }
 * @param {number} radius - Radius in meters
 * @returns {object} - { isValid: boolean, distance: number }
 */
export const validateGeofence = (currentPos, targetPos, radius) => {
  const distance = calculateHaversineDistance(
    currentPos.lat,
    currentPos.lng,
    targetPos.lat,
    targetPos.lng
  );
  return {
    isValid: distance <= radius,
    distance: Math.round(distance),
  };
};
