/**
 * Calculate Great-Circle Distance between two coordinates using Haversine formula (in km)
 */
export function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculate cardinal compass direction from point A to point B
 */
export function getCompassBearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(brng / 22.5) % 16;
  return directions[index];
}

/**
 * Find nearest storm cell to user GPS coordinates
 */
export function getNearestStormCell(userLat, userLng, stormCells = []) {
  if (!userLat || !userLng || !stormCells || stormCells.length === 0) return null;

  let nearest = null;
  let minDistance = Infinity;

  stormCells.forEach((cell) => {
    const lat = cell.lat || cell.latitude;
    const lng = cell.lng || cell.longitude;
    if (lat !== undefined && lng !== undefined) {
      const dist = getHaversineDistanceKm(userLat, userLng, lat, lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = {
          ...cell,
          distanceKm: dist,
          bearing: getCompassBearing(userLat, userLng, lat, lng),
        };
      }
    }
  });

  return nearest;
}

/**
 * Find nearest lightning strike to user GPS coordinates
 */
export function getNearestStrike(userLat, userLng, strikes = []) {
  if (!userLat || !userLng || !strikes || strikes.length === 0) return null;

  let nearest = null;
  let minDistance = Infinity;

  strikes.forEach((strike) => {
    const lat = strike.lat || strike.latitude;
    const lng = strike.lng || strike.longitude;
    if (lat !== undefined && lng !== undefined) {
      const dist = getHaversineDistanceKm(userLat, userLng, lat, lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = {
          ...strike,
          distanceKm: dist,
          bearing: getCompassBearing(userLat, userLng, lat, lng),
        };
      }
    }
  });

  return nearest;
}

/**
 * Compute local atmospheric risk and nowcast metrics specifically for user GPS position
 */
export function computeUserLocationTelemetry(userLocation, stormCells = [], strikes = [], baseForecast = null) {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) return null;

  const lat = userLocation.latitude;
  const lng = userLocation.longitude;

  const nearestCell = getNearestStormCell(lat, lng, stormCells);
  const nearestStrike = getNearestStrike(lat, lng, strikes);

  const cellDist = nearestCell ? nearestCell.distanceKm : 999;
  const cellRadius = nearestCell ? (nearestCell.radius_km || 15) : 15;
  const cellDbz = nearestCell ? (nearestCell.dbz || 45) : 20;
  const cellSpeed = nearestCell ? (nearestCell.speed_kmh || 30) : 30;

  // Calculate local thunderstorm probability (%)
  let localProb = 10;
  if (cellDist <= cellRadius) {
    localProb = Math.min(98, Math.round(75 + (cellDbz / 75) * 23));
  } else if (cellDist <= 30) {
    const factor = (30 - cellDist) / (30 - cellRadius);
    localProb = Math.min(90, Math.round(25 + factor * 60));
  } else if (cellDist <= 60) {
    localProb = Math.round(15 + ((60 - cellDist) / 30) * 15);
  }

  // Calculate local risk level
  let localRiskLevel = 'Low';
  let isSevere = false;
  if (cellDist <= cellRadius + 5 && cellDbz >= 48) {
    localRiskLevel = 'Severe';
    isSevere = true;
  } else if (cellDist <= 25) {
    localRiskLevel = 'Moderate';
  } else if (cellDist <= 50) {
    localRiskLevel = 'Elevated';
  } else {
    localRiskLevel = 'Low / Safe';
  }

  // Local estimated rainfall rate (mm/h)
  let localPrecipMmHr = 0;
  if (cellDist <= cellRadius) {
    localPrecipMmHr = Math.round(Math.max(5, (cellDbz / 65) * 45) * 10) / 10;
  } else if (cellDist <= cellRadius + 10) {
    localPrecipMmHr = Math.round(((cellRadius + 10 - cellDist) / 10) * 15 * 10) / 10;
  }

  // Local estimated wind gust (km/h)
  let localWindGustKmh = 18;
  if (cellDist <= cellRadius) {
    localWindGustKmh = Math.round(45 + (cellDbz / 70) * 40);
  } else if (cellDist <= 30) {
    localWindGustKmh = Math.round(25 + ((30 - cellDist) / 30) * 30);
  }

  // Local ETA to storm cell core
  let etaMinutes = null;
  if (cellDist <= 60 && cellSpeed > 0) {
    etaMinutes = Math.max(0, Math.round((cellDist / cellSpeed) * 60));
  }

  // Safety advisories based on local proximity
  let safetyDirective = 'Atmospheric conditions at your coordinates are currently stable.';
  if (cellDist <= 10) {
    safetyDirective = 'IMMEDIATE HAZARD: Convective core overhead or within 10 km. Seek indoor shelter immediately and avoid open areas.';
  } else if (cellDist <= 25) {
    safetyDirective = 'APPROACHING STORM: Thunderstorm cell within 25 km. Ground lightning discharge risk is elevated.';
  } else if (cellDist <= 50) {
    safetyDirective = 'ADVISORY: Distant convective activity detected. Monitor radar path vectors for incoming cells.';
  }

  return {
    latitude: lat,
    longitude: lng,
    accuracyMeters: Math.round(userLocation.accuracy || 20),
    altitudeMeters: userLocation.altitude ? Math.round(userLocation.altitude) : null,
    speedKmh: userLocation.speed ? Math.round(userLocation.speed * 3.6) : null,
    localProbability: `${localProb}%`,
    localProbabilityNum: localProb,
    localRiskLevel,
    isSevere,
    localPrecipMmHr,
    localWindGustKmh,
    etaMinutes,
    nearestCell,
    nearestStrike,
    safetyDirective,
  };
}

/**
 * Reverse geocode latitude and longitude to get locality/city name
 */
export async function reverseGeocodeLocation(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const locality =
      addr.city ||
      addr.town ||
      addr.suburb ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      'Detected Location';
    const state = addr.state || '';
    return state && locality !== state ? `${locality}, ${state}` : locality;
  } catch (err) {
    return null;
  }
}
